// models/ProviderScoreboard.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProviderScoreboard extends Document {
  order_id: mongoose.Types.ObjectId;
  attempt_number: number;
  provider: '5sim' | 'smspool';
  pool_or_operator: string;
  service: string;
  country: string;
  is_us_v?: boolean; // Specific tracker for US_V (United States Virtual)
  time_bought: Date;
  code_arrived: boolean | null; // null while pending, true if received in time, false if cancelled/timed out
  code_arrived_at?: Date;
  provider_order_id?: string;
  phone_number?: string;
  cost_usd?: number;
  cancellation_refunded?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderScoreboardSchema = new Schema<IProviderScoreboard>(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: 'OtpOrder',
      required: true,
      index: true,
    },
    attempt_number: {
      type: Number,
      required: true,
      default: 1,
    },
    provider: {
      type: String,
      enum: ['5sim', 'smspool'],
      required: true,
      index: true,
    },
    pool_or_operator: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
      index: true,
    },
    country: {
      type: String,
      required: true,
      index: true,
    },
    is_us_v: {
      type: Boolean,
      default: false,
    },
    time_bought: {
      type: Date,
      default: Date.now,
      index: true,
    },
    code_arrived: {
      type: Boolean,
      default: null, // null while order is in flight
      index: true,
    },
    code_arrived_at: {
      type: Date,
    },
    provider_order_id: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    cost_usd: {
      type: Number,
    },
    cancellation_refunded: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast statistical scoreboard queries
ProviderScoreboardSchema.index({ service: 1, time_bought: -1 });
ProviderScoreboardSchema.index({ service: 1, provider: 1, pool_or_operator: 1 });

export default mongoose.models.ProviderScoreboard ||
  mongoose.model<IProviderScoreboard>('ProviderScoreboard', ProviderScoreboardSchema);
