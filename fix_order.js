import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI || "mongodb+srv://clinton:Chid1234.@travis-pay.dbyddm8.mongodb.net/travis_pay?retryWrites=true&w=majority&appName=travis-pay";

async function run() {
  await mongoose.connect(uri);
  const OtpOrder = mongoose.models.OtpOrder || mongoose.model('OtpOrder', new mongoose.Schema({}, { strict: false }));
  
  const orderId = '6a8e99e44f67a835e2e5e682';
  const order = await OtpOrder.findById(orderId);
  
  if (order && order.status === 'pending_payment') {
    order.status = 'paid';
    await order.save();
    console.log('Order marked as paid in DB.');
    
    // Trigger the backend process directly via HTTP
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}` : 'http://localhost:5000';
    try {
      const res = await fetch(`${backendUrl}/api/internal/start-otp-process`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.INTERNAL_SECRET_KEY || 'default_secret'
        },
        body: JSON.stringify({ orderId }),
      });
      console.log('Backend trigger response:', res.status);
    } catch (err) {
      console.error('Failed to trigger backend:', err.message);
    }
  } else {
    console.log('Order is not pending_payment:', order?.status);
  }
  process.exit(0);
}
run();
