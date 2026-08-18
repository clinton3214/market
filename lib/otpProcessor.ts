import dbConnect from './mongodb';
import OtpOrder from '@/models/OtpOrder';
import { getFiveSimBalance, buyNumber, checkOrderStatus, cancelOrder } from './fiveSim';

// This function pushes updates to the WebSocket server if available
async function pushWsUpdate(orderId: string, payload: any) {
  try {
    // We can fetch to our own server.js REST endpoint to broadcast, 
    // or if we have a global pub/sub we can use it.
    // For simplicity, we can do an internal HTTP call to server.js on a specific port or path,
    // or just rely on server.js to periodically check, but push is better.
    // Let's assume server.js exposes a simple internal API for pushing WS events:
    await fetch('http://localhost:5000/api/internal/ws-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, ...payload }),
    });
  } catch (err) {
    // Ignore internal push errors
    console.error("WS Push Error:", err);
  }
}

async function refundPaystack(reference: string, amount_kobo: number) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
  try {
    const res = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: reference,
        amount: amount_kobo
      })
    });
    if (!res.ok) {
      console.error("Refund failed", await res.text());
    }
  } catch (err) {
    console.error("Refund error", err);
  }
}

export async function processOtpPurchase(orderId: string) {
  await dbConnect();
  const order = await OtpOrder.findById(orderId);
  
  if (!order || order.status !== 'paid') {
    return; // Already processed or invalid state
  }

  try {
    order.status = 'purchasing';
    await order.save();
    pushWsUpdate(orderId, { status: order.status });

    // 1. Check 5sim balance
    const balance = await getFiveSimBalance();
    // Assuming 5sim balance is in rubles or USD, we compare against cost_price (which we stored in the same currency)
    if (balance < order.cost_price) {
      // Insufficient balance, auto-refund
      order.status = 'failed_no_stock';
      order.state_transitions.push({ status: 'failed_no_stock', note: 'Insufficient 5sim balance' });
      await order.save();
      
      await refundPaystack(order.paystack_reference, order.sell_price * 100);
      pushWsUpdate(orderId, { status: order.status, error: "Service unavailable, payment refunded." });
      return;
    }

    // 2. Buy from 5sim
    let buyResult;
    try {
      buyResult = await buyNumber(order.country, order.service);
    } catch (err) {
      // Out of stock or other buy error
      order.status = 'failed_no_stock';
      order.state_transitions.push({ status: 'failed_no_stock', note: '5sim buy failed' });
      await order.save();
      
      await refundPaystack(order.paystack_reference, order.sell_price * 100);
      pushWsUpdate(orderId, { status: order.status, error: "Out of stock, payment refunded." });
      return;
    }

    // 3. Success -> Update order
    order.status = 'awaiting_sms'; // Or 'number_assigned'
    order.five_sim_order_id = buyResult.id;
    order.phone_number = buyResult.phone;
    order.expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await order.save();
    
    pushWsUpdate(orderId, { 
      status: order.status, 
      phone_number: order.phone_number,
      expires_at: order.expires_at 
    });

    // 4. Start the polling loop (Detached)
    startPollingLoop(orderId, order.five_sim_order_id, order.expires_at);

  } catch (error) {
    console.error(`Error processing OTP order ${orderId}:`, error);
  }
}

export function startPollingLoop(orderId: string, fiveSimOrderId: number, expiresAt: Date) {
  // Fire and forget
  setTimeout(() => {
    pollFiveSim(orderId, fiveSimOrderId, expiresAt);
  }, 3000); // Wait 3s before first poll
}

async function pollFiveSim(orderId: string, fiveSimOrderId: number, expiresAt: Date, attempt = 1) {
  try {
    await dbConnect();
    const order = await OtpOrder.findById(orderId);
    
    // Stop if order is no longer awaiting_sms
    if (!order || order.status !== 'awaiting_sms') return;

    // Check timeout
    if (new Date() > expiresAt) {
      // Timeout reached
      await cancelOrder(fiveSimOrderId);
      order.status = 'failed_timeout';
      order.state_transitions.push({ status: 'failed_timeout', note: '15 min timeout' });
      await order.save();
      
      await refundPaystack(order.paystack_reference, order.sell_price * 100);
      pushWsUpdate(orderId, { status: order.status, error: "Timeout reached, payment refunded." });
      return;
    }

    // Check status
    const statusResult = await checkOrderStatus(fiveSimOrderId);
    
    // Status can be PENDING, RECEIVED, CANCELED, TIMEOUT, BANNED
    if (statusResult.status === 'CANCELED' || statusResult.status === 'TIMEOUT' || statusResult.status === 'BANNED') {
      order.status = 'failed_timeout';
      order.state_transitions.push({ status: 'failed_timeout', note: `5sim status: ${statusResult.status}` });
      await order.save();
      
      await refundPaystack(order.paystack_reference, order.sell_price * 100);
      pushWsUpdate(orderId, { status: order.status, error: `Order failed (${statusResult.status}), payment refunded.` });
      return;
    }

    // Check if SMS arrived
    if (statusResult.sms && statusResult.sms.length > 0) {
      const latestSms = statusResult.sms[0]; // Or combine them
      order.status = 'code_delivered';
      order.otp_code = latestSms.code;
      order.full_sms_text = latestSms.text;
      await order.save();

      pushWsUpdate(orderId, { 
        status: order.status, 
        otp_code: order.otp_code, 
        full_sms_text: order.full_sms_text 
      });
      return; // Done!
    }

    // Calculate backoff: 3s + (attempt * 1s), max 10s
    const delay = Math.min(3000 + (attempt * 1000), 10000);
    
    setTimeout(() => {
      pollFiveSim(orderId, fiveSimOrderId, expiresAt, attempt + 1);
    }, delay);

  } catch (error) {
    console.error(`Polling error for order ${orderId}:`, error);
    // Retry on network error after 5s
    setTimeout(() => {
      pollFiveSim(orderId, fiveSimOrderId, expiresAt, attempt);
    }, 5000);
  }
}
