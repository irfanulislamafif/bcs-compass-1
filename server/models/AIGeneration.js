import mongoose from 'mongoose';

const aiGenerationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      required: true,
      enum: ['analyze', 'mcq', 'written', 'flashcards', 'notes', 'facts', 'memorize'],
      index: true,
    },
    inputChars: { type: Number, default: 0 },
    materialPreview: { type: String, default: '', maxlength: 500 },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    errorMessage: { type: String, default: '' },
    output: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

aiGenerationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('AIGeneration', aiGenerationSchema);