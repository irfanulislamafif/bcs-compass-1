import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    subjectId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    section: { type: String, default: "", maxlength: 120 },

    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: [(v) => v.length === 4, "Exactly 4 options required"],
    },
    answer: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: "" },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    type: { type: String, default: "mcq" },
    sourceType: {
      type: String,
      enum: ["previous", "ai", "user", "demo"],
      default: "ai",
      index: true,
    },
    language: {
      type: String,
      enum: ["en", "bn"],
      default: "en",
    },

    /* Extra fields for manual questions */
    marks: { type: Number, default: 1, min: 0 },
    timeLimitSec: { type: Number, default: 60, min: 5, max: 3600 },

    /* Private (owner only) vs public (visible to all approved) */
    isPublic: { type: Boolean, default: false, index: true },

    exam: { type: String, default: "" },
    year: { type: Number },
    source: { type: String, default: "" },
    tags: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    generationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIGeneration",
      default: null,
    },
  },
  { timestamps: true },
);

questionSchema.index({ userId: 1, status: 1, createdAt: -1 });
questionSchema.index({ subjectId: 1, topicId: 1, status: 1 });

export default mongoose.model("Question", questionSchema);
