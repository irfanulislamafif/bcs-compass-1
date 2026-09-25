import { aiGenerateJSON } from '../services/ai/index.js';
import {
  ANALYZE_PROMPT,
  MCQ_PROMPT,
  WRITTEN_PROMPT,
  FLASHCARD_PROMPT,
  NOTES_PROMPT,
  FACTS_PROMPT,
  MEMORIZE_PROMPT,
} from '../services/ai/prompts.js';
import AIGeneration from '../models/AIGeneration.js';

const MAX_CHARS = Number(process.env.AI_MAX_INPUT_CHARS || 20000);
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 30);

/* ---------- Helpers ---------- */

function validateMaterial(material) {
  if (!material || typeof material !== 'string') {
    const err = new Error('Study material is required.');
    err.status = 400;
    throw err;
  }
  const trimmed = material.trim();
  if (trimmed.length < 50) {
    const err = new Error('Study material is too short. Paste at least 50 characters.');
    err.status = 400;
    throw err;
  }
  if (trimmed.length > MAX_CHARS) {
    const err = new Error(`Study material is too long (max ${MAX_CHARS} characters).`);
    err.status = 400;
    throw err;
  }
  return trimmed;
}

async function enforceDailyLimit(userId) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const count = await AIGeneration.countDocuments({
    userId,
    status: 'success',
    createdAt: { $gte: since },
  });

  if (count >= DAILY_LIMIT) {
    const err = new Error(
      `Daily AI limit reached (${DAILY_LIMIT} per day). Try again tomorrow.`
    );
    err.status = 429;
    throw err;
  }
}

async function logGeneration({
  userId,
  kind,
  material,
  output,
  status,
  errorMessage,
}) {
  try {
    await AIGeneration.create({
      userId,
      kind,
      inputChars: material.length,
      materialPreview: material.slice(0, 500),
      status,
      errorMessage: errorMessage || '',
      output: output || null,
    });
  } catch (e) {
    // Logging failure should not fail the response
    console.error('Failed to log AI generation:', e.message);
  }
}

/* ---------- Generic wrapper ---------- */

function wrap(handler, kind) {
  return async (req, res, next) => {
    let material = '';
    try {
      const payload = handler.parse(req.body);
      material = validateMaterial(payload.material);
      await enforceDailyLimit(req.user._id);

      const prompt = handler.buildPrompt({ ...payload, material });
      const json = await aiGenerateJSON(prompt);

      await logGeneration({
        userId: req.user._id,
        kind,
        material,
        output: json,
        status: 'success',
      });

      res.json({ ok: true, kind, result: json });
    } catch (err) {
      await logGeneration({
        userId: req.user._id,
        kind,
        material,
        output: null,
        status: 'failed',
        errorMessage: err.message,
      });
      next(err);
    }
  };
}

/* ---------- Endpoint handlers ---------- */

export const analyze = wrap(
  {
    parse: (body) => ({ material: body?.material }),
    buildPrompt: ({ material }) => ({
      systemPrompt: ANALYZE_PROMPT.system,
      userPrompt: ANALYZE_PROMPT.user(material),
      maxOutputTokens: 2048,
      temperature: 0.3,
    }),
  },
  'analyze'
);

export const generateMcq = wrap(
  {
    parse: (body) => ({
      material: body?.material,
      count: Math.min(20, Math.max(1, Number(body?.count) || 10)),
      difficulty: ['easy', 'medium', 'hard'].includes(body?.difficulty)
        ? body.difficulty
        : 'medium',
      style: typeof body?.style === 'string' && body.style.trim()
        ? body.style.trim().slice(0, 100)
        : 'BCS preliminary style',
    }),
    buildPrompt: ({ material, count, difficulty, style }) => ({
      systemPrompt: MCQ_PROMPT.system,
      userPrompt: MCQ_PROMPT.user({ material, count, difficulty, style }),
      maxOutputTokens: 3000,
      temperature: 0.5,
    }),
  },
  'mcq'
);

export const generateWritten = wrap(
  {
    parse: (body) => ({
      material: body?.material,
      count: Math.min(10, Math.max(1, Number(body?.count) || 5)),
    }),
    buildPrompt: ({ material, count }) => ({
      systemPrompt: WRITTEN_PROMPT.system,
      userPrompt: WRITTEN_PROMPT.user({ material, count }),
      maxOutputTokens: 2500,
      temperature: 0.5,
    }),
  },
  'written'
);

export const generateFlashcards = wrap(
  {
    parse: (body) => ({
      material: body?.material,
      count: Math.min(30, Math.max(1, Number(body?.count) || 12)),
    }),
    buildPrompt: ({ material, count }) => ({
      systemPrompt: FLASHCARD_PROMPT.system,
      userPrompt: FLASHCARD_PROMPT.user({ material, count }),
      maxOutputTokens: 2000,
      temperature: 0.4,
    }),
  },
  'flashcards'
);

export const generateNotes = wrap(
  {
    parse: (body) => ({ material: body?.material }),
    buildPrompt: ({ material }) => ({
      systemPrompt: NOTES_PROMPT.system,
      userPrompt: NOTES_PROMPT.user(material),
      maxOutputTokens: 2500,
      temperature: 0.3,
    }),
  },
  'notes'
);

export const extractFacts = wrap(
  {
    parse: (body) => ({ material: body?.material }),
    buildPrompt: ({ material }) => ({
      systemPrompt: FACTS_PROMPT.system,
      userPrompt: FACTS_PROMPT.user(material),
      maxOutputTokens: 2000,
      temperature: 0.3,
    }),
  },
  'facts'
);

export const extractMemorize = wrap(
  {
    parse: (body) => ({ material: body?.material }),
    buildPrompt: ({ material }) => ({
      systemPrompt: MEMORIZE_PROMPT.system,
      userPrompt: MEMORIZE_PROMPT.user(material),
      maxOutputTokens: 2000,
      temperature: 0.3,
    }),
  },
  'memorize'
);

/* GET /api/ai/history — last 20 generations for the user */
export async function history(req, res, next) {
  try {
    const items = await AIGeneration.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('kind status inputChars materialPreview createdAt errorMessage');
    res.json({ items });
  } catch (err) {
    next(err);
  }
}