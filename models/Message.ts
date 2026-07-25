import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

MessageSchema.virtual('id').get(function (this: any) {
  return this._id.toHexString();
});

MessageSchema.set('toJSON', {
  virtuals: true,
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
