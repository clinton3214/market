// lib/otpLogic.ts
import dbConnect from '@/lib/mongodb';
import OtpOrder from '@/models/OtpOrder';
import { executeOrderWithAutoRetry } from '@/lib/autoRetryEngine';

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
    // Run full auto-retry engine (up to 3 provider/pool attempts with auto-refund)
    return await executeOrderWithAutoRetry(orderId);
  } catch (error: any) {
    console.error(`Error processing OTP order ${orderId} in auto-retry logic:`, error);
    try {
      const failedOrder = await OtpOrder.findById(orderId);
      if (failedOrder && failedOrder.status === 'purchasing') {
        failedOrder.status = 'failed_no_stock';
        failedOrder.state_transitions.push({
          status: 'failed_no_stock',
          timestamp: new Date(),
          note: `System error: ${error.message}`,
        });
        await failedOrder.save();
      }
    } catch (dbError) {
      console.error('Failed to mark order as failed after error', dbError);
    }
    return true;
  }
}
