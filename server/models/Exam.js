import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true },

    subjectId: { type: String, default: '' },
    topicIds: { type: [String], default: [] },
    difficulty: { type: String, default: 'any' },

    /* Snapshot of the questions used at exam-creation time */
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        order: { type: Number, required: true },
      },
    ],

    durationSec: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },

    /* AI vs manual vs mixed */
    source: {
      type: String,
      enum: ['ai', 'bank', 'mixed'],
      default: 'ai',
    },
  },
  { timestamps: true }
);

examSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Exam', examSchema);