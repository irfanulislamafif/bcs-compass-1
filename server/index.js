import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import questionRoutes from "./routes/questions.js";
import examRoutes from "./routes/exams.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many attempts. Please try again later." },
});
app.use("/api/auth", authLimiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many AI requests. Please wait a moment." },
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "bcs-compass-api",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ BCS Compass API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
