import mongoose from 'mongoose';
import crypto from 'crypto';

export type OtpOrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'purchasing'
  | 'number_assigned'
  | 'awaiting_sms'
  | 'code_delivered'
  | 'completed'
  | 'failed_no_stock'
  | 'failed_timeout'
  | 'refunded'
  | 'cancelled_by_user';

const StateTransitionSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String }
});

const OtpOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for guest checkouts
  },
  customer_email: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  cost_price: {
    type: Number,
    required: true, // This represents NGN cost
  },
  usd_cost: {
    type: Number,
  },
  exchange_rate_used: {
    type: Number,
  },
  sell_price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'pending_payment',
      'paid',
      'purchasing',
      'number_assigned',
      'awaiting_sms',
      'code_delivered',
      'completed',
      'failed_no_stock',
      'failed_timeout',
      'refunded',
      'cancelled_by_user'
    ],
    default: 'pending_payment',
  },
  phone_number: {
    type: String,
  },
  otp_code: {
    type: String,
  },
  full_sms_text: {
    type: String,
  },
  five_sim_order_id: {
    type: Number,
  },
  paystack_reference: {
    type: String,
    unique: true,
    sparse: true, // sparse because pending_payment might not have it yet or we might generate it before paystack
  },
  ws_auth_token: {
    type: String,
    default: () => crypto.randomBytes(16).toString('hex'), // For WebSocket auth
  },
  expires_at: {
    type: Date,
  },
  state_transitions: [StateTransitionSchema],
}, { timestamps: true });

// Ensure we push to state_transitions whenever status changes
OtpOrderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.state_transitions.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

export default mongoose.models.OtpOrder || mongoose.model('OtpOrder', OtpOrderSchema);
