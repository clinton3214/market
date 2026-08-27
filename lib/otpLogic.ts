import dbConnect from '@/lib/mongodb';
import OtpOrder from '@/models/OtpOrder';
import { getFiveSimBalance, buyNumber } from '@/lib/fiveSim';

export async function executeOtpPurchase(orderId: string): Promise<boolean> {
  await dbConnect();

  // Atomic transition: only one caller can move from 'paid' → 'purchasing'
  const order = await OtpOrder.findOneAndUpdate(
    { _id: orderId, status: 'paid' },
    { $set: { status: 'purchasing' }, $push: { state_transitions: { status: 'purchasing', timestamp: new Date() } } },
    { new: true }
  );

  if (!order) {
    // Already processing or not in paid state
    return false;
  }

  try {
    // 1. Check 5sim balance
    const balance = await getFiveSimBalance();
    if (balance < order.cost_price) {
      order.status = 'failed_no_stock';
      order.state_transitions.push({ status: 'failed_no_stock', timestamp: new Date(), note: 'Insufficient 5sim balance' });
      await order.save();
      return true; // We handled it
    }

    // 2. Buy from 5sim
    const buyResult = await buyNumber(order.country, order.service);

    // 3. Success -> Update order
    order.status = 'awaiting_sms';
    order.five_sim_order_id = buyResult.id;
    order.phone_number = buyResult.phone;
    order.expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    order.state_transitions.push({ status: 'awaiting_sms', timestamp: new Date() });
    await order.save();
    
    return true;
  } catch (error: any) {
    console.error(`Error processing OTP order ${orderId} in frontend logic:`, error);
    try {
      const failedOrder = await OtpOrder.findById(orderId);
      if (failedOrder && failedOrder.status === 'purchasing') {
        failedOrder.status = 'failed_no_stock';
        failedOrder.state_transitions.push({ status: 'failed_no_stock', timestamp: new Date(), note: `System error: ${error.message}` });
        await failedOrder.save();
      }
    } catch (dbError) {
      console.error('Failed to mark order as failed after 5sim error', dbError);
    }
    return true;
  }
}
