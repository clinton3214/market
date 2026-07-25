import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: false,
    },
    userEmail: {
      type: String,
      default: '',
    },
    userName: {
      type: String,
      default: 'Guest User',
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastMessageText: {
      type: String,
      default: '',
    },
    unreadCountAdmin: {
      type: Number,
      default: 0,
    },
    unreadCountUser: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

ConversationSchema.virtual('id').get(function (this: any) {
  return this._id.toHexString();
});

ConversationSchema.set('toJSON', {
  virtuals: true,
});

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
