import { aiGenerateJSON } from '../services/ai/index.js';
import {
  ANALYZE_PROMPT,
  MCQ_PROMPT,
  WRITTEN_PROMPT,
  FLASHCARD_PROMPT,
  NOTES_PROMPT,
  FACTS_PROMPT,
  MEMORIZE_PROMPT,
  EVALUATE_PROMPT,
} from '../services/ai/prompts.js';
import AIGeneration from '../models/AIGeneration.js';

const MAX_CHARS = Number(process.env.AI_MAX_INPUT_CHARS || 20000);
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 30);

const ALLOWED_LANGS = ['auto', 'en', 'bn'];

function normalizeLanguage(v) {
  return ALLOWED_LANGS.includes(v) ? v : 'auto';
}

function validateMaterial(material) {
  if (!material || typeof material !== 'string') {
    const err = new Error('Study material is required.');
    err.status = 400;
    throw err;
  }
  const trimmed = material.trim();
  if (trimmed.length < 50) {
    const err = new Error(
      'Study material is too short. Paste at least 50 characters.'
    );
    err.status = 400;
    throw err;
  }
  if (trimmed.length > MAX_CHARS) {
    const err = new Error(
      `Study material is too long (max ${MAX_CHARS} characters).`
    );
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
    return await AIGeneration.create({
      userId,
      kind,
      inputChars: material.length,
      materialPreview: material.slice(0, 500),
      status,
      errorMessage: errorMessage || '',
      output: output || null,
    });
  } catch (e) {
    console.error('Failed to log AI generation:', e.message);
    return null;
  }
}

function wrap(handler, kind) {
  return async (req, res, next) => {
    let material = '';
    try {
      const payload = handler.parse(req.body);
      material = validateMaterial(payload.material);
      await enforceDailyLimit(req.user._id);

      const prompt = handler.buildPrompt({ ...payload, material });
      const json = await aiGenerateJSON(prompt);

      const genLog = await logGeneration({
        userId: req.user._id,
        kind,
        material,
        output: json,
        status: 'success',
      });

      res.json({
        ok: true,
        kind,
        result: json,
        generationId: genLog?._id || null,
      });
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

export const analyze = wrap(
  {
    parse: (body) => ({
      material: body?.material,
      outputLanguage: normalizeLanguage(body?.outputLanguage),
    }),
    buildPrompt: ({ material, outputLanguage }) => ({
      systemPrompt: ANALYZE_PROMPT.system,
      userPrompt: ANALYZE_PROMPT.user(material, outputLanguage),
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
      style:
        typeof body?.style === 'string' && body.style.trim()
          ? body.style.trim().slice(0, 100)
          : 'BCS preliminary style',
      outputLanguage: normalizeLanguage(body?.outputLanguage),
    }),
    buildPrompt: ({ material, count, difficulty, style, outputLanguage }) => ({
      systemPrompt: MCQ_PROMPT.system,
      userPrompt: MCQ_PROMPT.user({
        material,
        count,
        difficulty,
        style,
        outputLanguage,
      }),
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
      outputLanguage: normalizeLanguage(body?.outputLanguage),
    }),
    buildPrompt: ({ material, count, outputLanguage }) => ({
      systemPrompt: WRITTEN_PROMPT.system,
      userPrompt: WRITTEN_PROMPT.user({ material, count, outputLanguage }),
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
      outputLanguage: normalizeLanguage(body?.outputLanguage),
    }),
    buildPrompt: ({ material, count, outputLanguage }) => ({
      systemPrompt: FLASHCARD_PROMPT.system,
      userPrompt: FLASHCARD_PROMPT.user({ material, count, outputLanguage }),
      maxOutputTokens: 2000,
      temperature: 0.4,
    }),
  },
  'flashcards'
);

export const generateNotes = wrap(
  {
    parse: (body) => ({
      material: body?.material,
      outputLanguage: normalizeLanguage(body?.outputLanguage),
    }),
    buildPrompt: ({ material, outputLanguage }) => ({
      systemPrompt: NOTES_PROMPT.system,
      userPrompt: NOTES_PROMPT.user(material, outputLanguage),
      maxOutputTokens: 2500,
      temperature: 0.3,
    }),
  },
  'notes'
);

export const extractFacts = wrap(
  {
    parse: (body) => ({
      material: body?.material,
      outputLanguage: normalizeLanguage(body?.outputLanguage),
    }),
    buildPrompt: ({ material, outputLanguage }) => ({
      systemPrompt: FACTS_PROMPT.system,
      userPrompt: FACTS_PROMPT.user(material, outputLanguage),
      maxOutputTokens: 2000,
      temperature: 0.3,
    }),
  },
  'facts'
);

export const extractMemorize = wrap(
  {
    parse: (body) => ({
      material: body?.material,
      outputLanguage: normalizeLanguage(body?.outputLanguage),
    }),
    buildPrompt: ({ material, outputLanguage }) => ({
      systemPrompt: MEMORIZE_PROMPT.system,
      userPrompt: MEMORIZE_PROMPT.user(material, outputLanguage),
      maxOutputTokens: 2000,
      temperature: 0.3,
    }),
  },
  'memorize'
);

/* ------------------------------------------------------------------ */
/*  POST /api/ai/evaluate                                             */
/* ------------------------------------------------------------------ */

export async function evaluateWritten(req, res, next) {
  let material = '';
  try {
    const {
      question,
      expectedPoints = [],
      userAnswer,
      marks = 10,
      outputLanguage,
    } = req.body || {};

    if (!question || typeof question !== 'string' || question.trim().length < 10) {
      return res.status(400).json({ message: 'Question is required.' });
    }
    if (
      !userAnswer ||
      typeof userAnswer !== 'string' ||
      userAnswer.trim().length < 20
    ) {
      return res
        .status(400)
        .json({ message: 'Your answer must be at least 20 characters.' });
    }
    if (userAnswer.length > 5000) {
      return res
        .status(400)
        .json({ message: 'Answer is too long (max 5000 characters).' });
    }
    const maxMarks = Math.min(50, Math.max(1, Number(marks) || 10));

    await enforceDailyLimit(req.user._id);

    const prompt = {
      systemPrompt: EVALUATE_PROMPT.system,
      userPrompt: EVALUATE_PROMPT.user({
        question: question.trim(),
        expectedPoints: Array.isArray(expectedPoints) ? expectedPoints : [],
        userAnswer: userAnswer.trim(),
        marks: maxMarks,
        outputLanguage: normalizeLanguage(outputLanguage),
      }),
      maxOutputTokens: 2500,
      temperature: 0.3,
    };

    const json = await aiGenerateJSON(prompt);

    material = `${question}\n---\n${userAnswer}`.slice(0, 2000);

    const genLog = await logGeneration({
      userId: req.user._id,
      kind: 'evaluate',
      material,
      output: json,
      status: 'success',
    });

    res.json({
      ok: true,
      kind: 'evaluate',
      result: json,
      generationId: genLog?._id || null,
    });
  } catch (err) {
    await logGeneration({
      userId: req.user._id,
      kind: 'evaluate',
      material,
      output: null,
      status: 'failed',
      errorMessage: err.message,
    });
    next(err);
  }
}

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