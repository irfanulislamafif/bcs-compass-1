import { aiGenerateJSON } from '../services/ai/index.js';
import { retrieveChunks } from '../services/rag/retrieve.js';
import StudyMaterial from '../models/StudyMaterial.js';
import AIGeneration from '../models/AIGeneration.js';

const ALLOWED_LANGS = ['auto', 'en', 'bn'];
function normalizeLanguage(v) {
  return ALLOWED_LANGS.includes(v) ? v : 'auto';
}

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                    */
/* ------------------------------------------------------------------ */

async function enforceDailyLimit(userId) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 30);
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
  preview,
  output,
  status,
  errorMessage,
}) {
  try {
    return await AIGeneration.create({
      userId,
      kind,
      inputChars: preview.length,
      materialPreview: preview.slice(0, 500),
      status,
      errorMessage: errorMessage || '',
      output: output || null,
    });
  } catch (e) {
    console.error('Failed to log RAG generation:', e.message);
    return null;
  }
}

function buildContextBlock(chunks) {
  if (!chunks || chunks.length === 0) return '';
  return chunks
    .map((c, i) => `--- SOURCE ${i + 1}: "${c.materialTitle}" ---\n${c.text}`)
    .join('\n\n');
}

/* ------------------------------------------------------------------ */
/*  POST /api/rag/ask                                                 */
/* ------------------------------------------------------------------ */

export async function askPdf(req, res, next) {
  let preview = '';
  try {
    const {
      question,
      materialId = null,
      outputLanguage,
      topK = 5,
    } = req.body || {};

    if (!question || typeof question !== 'string' || question.trim().length < 5) {
      return res.status(400).json({ message: 'Please ask a question.' });
    }
    if (question.length > 500) {
      return res.status(400).json({ message: 'Question is too long.' });
    }

    await enforceDailyLimit(req.user._id);

    const chunks = await retrieveChunks({
      userId: req.user._id,
      query: question,
      materialId,
      topK: Math.min(8, Math.max(1, Number(topK) || 5)),
    });

    if (chunks.length === 0) {
      return res.status(404).json({
        message:
          'No matching content found in your PDFs. Upload a PDF or try a different question.',
      });
    }

    preview = `Q: ${question}\n\nContext:\n${buildContextBlock(chunks)}`;

    const lang =
      outputLanguage === 'bn'
        ? 'Bangla (বাংলা)'
        : outputLanguage === 'en'
        ? 'English'
        : 'the same language as the question';

    const systemPrompt = `You are a study assistant for BCS exam preparation.
Answer the user's question using ONLY the provided SOURCE excerpts.
Do not invent facts. If the sources do not contain the answer, say so clearly.
Write the answer in ${lang}.
Return valid JSON only, no markdown.`;

    const userPrompt = `QUESTION:
"""
${question}
"""

SOURCES:
${buildContextBlock(chunks)}

Return JSON in this exact schema:
{
  "answer": "a clear, exam-focused answer grounded strictly in the sources",
  "keyPoints": ["short bullet 1", "short bullet 2"],
  "citations": [
    { "sourceNumber": 1, "excerpt": "short quote from the source used" }
  ],
  "confidence": "high | medium | low",
  "notFound": false
}

If the answer is not in the sources, set "notFound": true and explain in "answer".`;

    const json = await aiGenerateJSON({
      systemPrompt,
      userPrompt,
      maxOutputTokens: 2000,
      temperature: 0.3,
    });

    const genLog = await logGeneration({
      userId: req.user._id,
      kind: 'rag-ask',
      preview,
      output: json,
      status: 'success',
    });

    res.json({
      ok: true,
      kind: 'rag-ask',
      result: {
        ...json,
        sources: chunks.map((c, i) => ({
          sourceNumber: i + 1,
          materialId: c.materialId,
          materialTitle: c.materialTitle,
          chunkIndex: c.chunkIndex,
          preview: c.text.slice(0, 300),
        })),
      },
      generationId: genLog?._id || null,
    });
  } catch (err) {
    await logGeneration({
      userId: req.user._id,
      kind: 'rag-ask',
      preview,
      output: null,
      status: 'failed',
      errorMessage: err.message,
    });
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/rag/mcq                                                 */
/*  Generate MCQs strictly from the selected PDF                     */
/* ------------------------------------------------------------------ */

export async function pdfMcq(req, res, next) {
  let preview = '';
  try {
    const {
      materialId,
      count = 10,
      difficulty = 'medium',
      outputLanguage,
    } = req.body || {};

    if (!materialId) {
      return res.status(400).json({ message: 'materialId is required.' });
    }

    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId: req.user._id,
    });
    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    await enforceDailyLimit(req.user._id);

    const n = Math.min(20, Math.max(1, Number(count) || 10));
    const context = buildContextBlock(
      material.chunks.slice(0, 30).map((c) => ({
        materialTitle: material.title,
        text: c.text,
        chunkIndex: c.index,
      }))
    );

    preview = `Material: ${material.title}\nCount: ${n}\nDifficulty: ${difficulty}`;

    const lang =
      outputLanguage === 'bn'
        ? 'Bangla (বাংলা)'
        : outputLanguage === 'en'
        ? 'English'
        : 'the same language as the source material';

    const systemPrompt = `You are a BCS exam MCQ generator.
Generate questions ONLY from the provided SOURCE.
Do not invent facts outside the source.
Write content in ${lang}. Keep JSON keys in English.
Return valid JSON only.`;

    const userPrompt = `SOURCE (from PDF: "${material.title}"):
${context}

Generate exactly ${n} multiple-choice questions at difficulty "${difficulty}".

Return JSON:
{
  "questions": [
    {
      "question": "the question",
      "options": ["A", "B", "C", "D"],
      "answer": 0,
      "explanation": "one sentence",
      "difficulty": "easy | medium | hard",
      "topic": "short topic"
    }
  ]
}

Rules:
- Exactly ${n} questions.
- Exactly 4 options each.
- Exactly 1 correct answer (0-based index).
- Ground every question in the SOURCE above.`;

    const json = await aiGenerateJSON({
      systemPrompt,
      userPrompt,
      maxOutputTokens: 3500,
      temperature: 0.5,
    });

    const genLog = await logGeneration({
      userId: req.user._id,
      kind: 'rag-mcq',
      preview,
      output: json,
      status: 'success',
    });

    res.json({
      ok: true,
      kind: 'rag-mcq',
      result: json,
      generationId: genLog?._id || null,
    });
  } catch (err) {
    await logGeneration({
      userId: req.user._id,
      kind: 'rag-mcq',
      preview,
      output: null,
      status: 'failed',
      errorMessage: err.message,
    });
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/rag/analyze                                             */
/*  Analyze the whole PDF (summary + exam points + memorize list)     */
/* ------------------------------------------------------------------ */

export async function pdfAnalyze(req, res, next) {
  let preview = '';
  try {
    const { materialId, outputLanguage } = req.body || {};
    if (!materialId) {
      return res.status(400).json({ message: 'materialId is required.' });
    }

    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId: req.user._id,
    });
    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    await enforceDailyLimit(req.user._id);

    /* Feed first N chunks to the model */
    const context = buildContextBlock(
      material.chunks.slice(0, 25).map((c) => ({
        materialTitle: material.title,
        text: c.text,
        chunkIndex: c.index,
      }))
    );

    preview = `Analyze material: ${material.title} (${material.textLength} chars)`;

    const lang =
      outputLanguage === 'bn'
        ? 'Bangla (বাংলা)'
        : outputLanguage === 'en'
        ? 'English'
        : 'the same language as the source material';

    const systemPrompt = `You are a BCS study assistant.
Analyze the given PDF excerpts and return exam-focused JSON only.
Write content in ${lang}. Keep JSON keys in English.`;

    const userPrompt = `SOURCE (from PDF: "${material.title}"):
${context}

Return JSON:
{
  "summary": "3-5 sentences",
  "importantFacts": ["fact 1", "..."],
  "keyConcepts": [{ "name": "concept", "explanation": "1-2 sentences" }],
  "importantDates": [{ "date": "date", "event": "event" }],
  "importantNames": [{ "name": "name", "role": "role" }],
  "definitions": [{ "term": "term", "definition": "definition" }],
  "potentialExamPoints": ["point 1", "..."],
  "thingsToMemorize": ["item 1", "..."],
  "confusingAreas": ["area 1", "..."]
}`;

    const json = await aiGenerateJSON({
      systemPrompt,
      userPrompt,
      maxOutputTokens: 2500,
      temperature: 0.3,
    });

    const genLog = await logGeneration({
      userId: req.user._id,
      kind: 'rag-analyze',
      preview,
      output: json,
      status: 'success',
    });

    res.json({
      ok: true,
      kind: 'rag-analyze',
      result: json,
      generationId: genLog?._id || null,
    });
  } catch (err) {
    await logGeneration({
      userId: req.user._id,
      kind: 'rag-analyze',
      preview,
      output: null,
      status: 'failed',
      errorMessage: err.message,
    });
    next(err);
  }
}