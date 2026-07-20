import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true },
    handle: { type: String, required: true },
    name: { type: String },
    followers: { type: String, required: true },
    category: { type: String },
    price: { type: Number, required: true },
    verified: { type: Boolean, default: true },
    engagement: { type: String },
    status: { type: String, enum: ['available', 'sold'], default: 'available' },
    
    // SECURE FIELDS (Never sent to the public frontend unless explicitly selected)
    credentials: {
      accountEmail: { type: String },
      emailPassword: { type: String },
      accountUsername: { type: String },
      accountPassword: { type: String },
    },
  },
  { timestamps: true }
);

// We define a virtual id property for convenience to match frontend types
listingSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

listingSchema.set('toJSON', {
  virtuals: true,
});

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);

export default Listing;
