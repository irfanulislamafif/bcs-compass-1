import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    text: { type: String, required: true },
    charCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const studyMaterialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    originalFilename: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    sizeBytes: { type: Number, default: 0 },

    /* Extracted and cleaned text */
    text: { type: String, required: true },
    textLength: { type: Number, default: 0 },

    /* Pre-chunked for retrieval */
    chunks: { type: [chunkSchema], default: [] },

    language: { type: String, enum: ['en', 'bn', 'mixed'], default: 'en' },

    /* Extracted metadata */
    pageCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['ready', 'processing', 'failed'],
      default: 'ready',
    },
    errorMessage: { type: String, default: '' },
  },
  { timestamps: true }
);

/* Full-text search index for retrieval */
studyMaterialSchema.index({ title: 'text', text: 'text' });
studyMaterialSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('StudyMaterial', studyMaterialSchema);