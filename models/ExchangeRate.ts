import mongoose from 'mongoose';

const ExchangeRateSchema = new mongoose.Schema({
  pair: {
    type: String,
    required: true,
    unique: true, // e.g., 'USD_NGN'
  },
  rate: {
    type: Number,
    required: true,
  },
  last_fetched: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ExchangeRate || mongoose.model('ExchangeRate', ExchangeRateSchema);
