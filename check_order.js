import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI || "mongodb+srv://clinton:Chid1234.@travis-pay.dbyddm8.mongodb.net/travis_pay?retryWrites=true&w=majority&appName=travis-pay";
mongoose.connect(uri).then(async () => {
  const OtpOrder = mongoose.models.OtpOrder || mongoose.model('OtpOrder', new mongoose.Schema({}, { strict: false }));
  const order = await OtpOrder.findOne({ _id: '6a8e99e44f67a835e2e5e682' });
  console.log(order);
  process.exit(0);
});
