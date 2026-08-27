import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import crypto from 'crypto';

// Re-implement the FiveSim helpers since we're in pure Node without Next.js path aliases
const FIVESIM_API_KEY = process.env.FIVESIM_API_KEY || '';
const FIVESIM_BASE_URL = 'https://5sim.net/v1';

const getHeaders = () => ({
  'Authorization': `Bearer ${FIVESIM_API_KEY}`,
  'Accept': 'application/json',
});

const allowedOrigins = [
  'https://travispays.com',
  'https://www.travispays.com',
  'http://localhost:3000'
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}


async function getFiveSimBalance() {
  const response = await fetch(`${FIVESIM_BASE_URL}/user/profile`, { headers: getHeaders() });
  if (!response.ok) throw new Error(`Failed to fetch 5sim balance: ${response.statusText}`);
  const data = await response.json();
  return data.balance;
}

async function buyNumber(country, product, operator = 'any') {
  const response = await fetch(`${FIVESIM_BASE_URL}/user/buy/activation/${country}/${operator}/${product}`, {
    method: 'GET',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error(`5sim Buy Failed: ${await response.text()}`);
  return await response.json();
}

async function checkOrderStatus(orderId) {
  const response = await fetch(`${FIVESIM_BASE_URL}/user/check/${orderId}`, {
    method: 'GET',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error(`Failed to check 5sim order: ${response.statusText}`);
  return await response.json();
}

async function cancelOrder(orderId) {
  const response = await fetch(`${FIVESIM_BASE_URL}/user/cancel/${orderId}`, {
    method: 'GET',
    headers: getHeaders()
  });
  if (!response.ok) return null;
  return await response.json();
}

async function refundPaystack(reference, amount_kobo) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
  try {
    const res = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction: reference, amount: amount_kobo })
    });
    if (!res.ok) console.error("Refund failed", await res.text());
  } catch (err) {
    console.error("Refund error", err);
  }
}

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://clinton:Chid1234.@travis-pay.dbyddm8.mongodb.net/travis_pay?retryWrites=true&w=majority&appName=travis-pay";

mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB in server.js');
  resumeInFlightOrders();
}).catch(err => console.error('MongoDB connection error:', err));

// Simplified Schema for server.js to interact with the same DB
const OtpOrderSchema = new mongoose.Schema({
  status: String,
  country: String,
  service: String,
  cost_price: Number,
  sell_price: Number,
  five_sim_order_id: Number,
  paystack_reference: String,
  phone_number: String,
  otp_code: String,
  full_sms_text: String,
  ws_auth_token: String,
  expires_at: Date,
  state_transitions: [{ status: String, timestamp: Date, note: String }]
}, { timestamps: true, strict: false });

const OtpOrder = mongoose.models.OtpOrder || mongoose.model('OtpOrder', OtpOrderSchema);

// Server Setup
const PORT = process.env.PORT || 5000;
const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow non-browser clients (like curl)
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Internal endpoint for Next.js to trigger the background task
  if (req.method === 'POST' && req.url === '/api/internal/start-otp-process') {
    const authHeader = req.headers['x-internal-secret'];
    if (authHeader !== (process.env.INTERNAL_SECRET_KEY || 'default_secret')) {
      res.writeHead(401);
      return res.end("Unauthorized");
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { orderId } = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        
        // Detached async execution
        processOtpPurchase(orderId).catch(console.error);
      } catch (err) {
        res.writeHead(400);
        res.end("Bad Request");
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_order', async (data) => {
    const { orderId, wsToken } = data;
    try {
      const order = await OtpOrder.findById(orderId);
      if (!order) return socket.emit('error', 'Order not found');
      
      // WebSocket Auth verification
      if (order.ws_auth_token !== wsToken) {
        return socket.emit('error', 'Unauthorized');
      }

      socket.join(`order_${orderId}`);
      socket.emit('status_update', { 
        status: order.status,
        phone_number: order.phone_number,
        otp_code: order.otp_code,
        full_sms_text: order.full_sms_text,
        expires_at: order.expires_at
      });
    } catch (err) {
      socket.emit('error', 'Invalid request');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

function pushWsUpdate(orderId, payload) {
  io.to(`order_${orderId}`).emit('status_update', payload);
}

// Background Processing Logic
async function processOtpPurchase(orderId) {
  // Atomic transition: only one caller can move from 'paid' → 'purchasing'
  const order = await OtpOrder.findOneAndUpdate(
    { _id: orderId, status: 'paid' },
    { $set: { status: 'purchasing' }, $push: { state_transitions: { status: 'purchasing', timestamp: new Date() } } },
    { new: true }
  );
  if (!order) return; // Already processing, or not in 'paid' state

  try {
    pushWsUpdate(orderId, { status: order.status });

    // 1. Check 5sim balance
    const balance = await getFiveSimBalance();
    if (balance < order.cost_price) {
      order.status = 'failed_no_stock';
      order.state_transitions.push({ status: 'failed_no_stock', timestamp: new Date(), note: 'Insufficient 5sim balance' });
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
      order.status = 'failed_no_stock';
      order.state_transitions.push({ status: 'failed_no_stock', timestamp: new Date(), note: '5sim buy failed' });
      await order.save();
      await refundPaystack(order.paystack_reference, order.sell_price * 100);
      pushWsUpdate(orderId, { status: order.status, error: "Out of stock, payment refunded." });
      return;
    }

    // 3. Success -> Update order
    order.status = 'awaiting_sms';
    order.five_sim_order_id = buyResult.id;
    order.phone_number = buyResult.phone;
    order.expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    order.state_transitions.push({ status: 'awaiting_sms', timestamp: new Date() });
    await order.save();
    
    pushWsUpdate(orderId, { 
      status: order.status, 
      phone_number: order.phone_number,
      expires_at: order.expires_at 
    });

    // 4. Start the polling loop
    startPollingLoop(orderId, order.five_sim_order_id, order.expires_at);
  } catch (error) {
    console.error(`Error processing OTP order ${orderId}:`, error);
  }
}

function startPollingLoop(orderId, fiveSimOrderId, expiresAt) {
  setTimeout(() => {
    pollFiveSim(orderId, fiveSimOrderId, new Date(expiresAt));
  }, 3000);
}

async function pollFiveSim(orderId, fiveSimOrderId, expiresAt, attempt = 1) {
  try {
    const order = await OtpOrder.findById(orderId);
    if (!order || !['awaiting_sms', 'number_assigned', 'purchasing'].includes(order.status)) return;

    if (new Date() > expiresAt) {
      await cancelOrder(fiveSimOrderId);
      order.status = 'failed_timeout';
      order.state_transitions.push({ status: 'failed_timeout', timestamp: new Date(), note: '15 min timeout' });
      await order.save();
      await refundPaystack(order.paystack_reference, order.sell_price * 100);
      pushWsUpdate(orderId, { status: order.status, error: "Timeout reached, payment refunded." });
      return;
    }

    const statusResult = await checkOrderStatus(fiveSimOrderId);
    
    if (statusResult.status === 'CANCELED' || statusResult.status === 'TIMEOUT' || statusResult.status === 'BANNED') {
      order.status = 'failed_timeout';
      order.state_transitions.push({ status: 'failed_timeout', timestamp: new Date(), note: `5sim status: ${statusResult.status}` });
      await order.save();
      await refundPaystack(order.paystack_reference, order.sell_price * 100);
      pushWsUpdate(orderId, { status: order.status, error: `Order failed (${statusResult.status}), payment refunded.` });
      return;
    }

    if (statusResult.sms && statusResult.sms.length > 0) {
      const latestSms = statusResult.sms[0];
      order.status = 'code_delivered';
      order.otp_code = latestSms.code;
      order.full_sms_text = latestSms.text;
      order.state_transitions.push({ status: 'code_delivered', timestamp: new Date() });
      await order.save();

      pushWsUpdate(orderId, { 
        status: order.status, 
        otp_code: order.otp_code, 
        full_sms_text: order.full_sms_text 
      });
      return; 
    }

    const delay = Math.min(3000 + (attempt * 1000), 10000);
    setTimeout(() => pollFiveSim(orderId, fiveSimOrderId, expiresAt, attempt + 1), delay);

  } catch (error) {
    console.error(`Polling error for order ${orderId}:`, error);
    setTimeout(() => pollFiveSim(orderId, fiveSimOrderId, expiresAt, attempt), 5000);
  }
}

// CRASH RECOVERY
async function resumeInFlightOrders() {
  try {
    // 1. Recover orders stuck in 'paid'
    // This happens if the webhook updated DB to 'paid' but couldn't reach server.js
    // We only want to recover orders that have been stuck for at least 1-2 minutes 
    // to avoid a race condition with a webhook currently processing.
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    const stuckPaidOrders = await OtpOrder.find({
      status: 'paid',
      updatedAt: { $lt: twoMinutesAgo } // Assuming Mongoose timestamps are on
    });

    for (const order of stuckPaidOrders) {
      console.log(`[Crash Recovery] Kicking off stuck paid order: ${order._id}`);
      processOtpPurchase(order._id).catch(console.error);
    }

    // 2. Recover orders currently mid-flight (purchasing, assigned, waiting)
    const inFlightOrders = await OtpOrder.find({
      status: { $in: ['purchasing', 'number_assigned', 'awaiting_sms'] }
    });

    console.log(`[Crash Recovery] Found ${inFlightOrders.length} mid-flight OTP orders to resume.`);

    for (const order of inFlightOrders) {
      if (order.status === 'purchasing') {
        // We failed during the initial 5sim buy process. 
        // We shouldn't safely retry buying to avoid double spend if it actually succeeded just before crash.
        // Easiest safe path: refund it to be absolutely sure, or just mark failed.
        console.log(`Refunding stuck purchasing order ${order._id}`);
        order.status = 'failed_no_stock';
        order.state_transitions.push({ status: 'failed_no_stock', timestamp: new Date(), note: 'Crashed during purchasing phase' });
        await order.save();
        await refundPaystack(order.paystack_reference, order.sell_price * 100);
      } else if (order.five_sim_order_id && order.expires_at) {
        // Resume polling
        startPollingLoop(order._id, order.five_sim_order_id, order.expires_at);
      }
    }
  } catch (err) {
    console.error("Crash recovery failed", err);
  }
}

server.listen(PORT, () => {
  console.log(`WebSocket & Polling Server running on port ${PORT}`);
});
