import { generateGemini } from './gemini.js';

/**
 * Provider-agnostic entry point.
 * Returns a raw string (the model's text output).
 *
 * @param {Object} opts
 * @param {string} opts.systemPrompt
 * @param {string} opts.userPrompt
 * @param {number} [opts.maxOutputTokens]
 * @param {number} [opts.temperature]
 */
export async function aiGenerate({
  systemPrompt,
  userPrompt,
  maxOutputTokens = 2048,
  temperature = 0.4,
}) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  if (!process.env.AI_API_KEY) {
    const err = new Error(
      'AI is not configured on the server. Add AI_API_KEY to server/.env.'
    );
    err.status = 503;
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }

  switch (provider) {
    case 'gemini':
      return generateGemini({
        systemPrompt,
        userPrompt,
        maxOutputTokens,
        temperature,
      });
    default: {
      const err = new Error(`Unsupported AI provider: ${provider}`);
      err.status = 500;
      throw err;
    }
  }
}

/**
 * Helper — asks the model for JSON and safely parses it.
 * Gemini often wraps JSON in ```json ... ``` fences, so we strip them.
 */
export async function aiGenerateJSON(opts) {
  const raw = await aiGenerate(opts);
  return parseJsonLoose(raw);
}

function parseJsonLoose(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty AI response');
  }

  // Strip markdown code fences
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }

  // Find first { ... } or [ ... ] block
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let start = -1;
  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error('AI did not return JSON');
  }
  if (firstBrace === -1) start = firstBracket;
  else if (firstBracket === -1) start = firstBrace;
  else start = Math.min(firstBrace, firstBracket);

  const lastBrace = text.lastIndexOf('}');
  const lastBracket = text.lastIndexOf(']');
  const end = Math.max(lastBrace, lastBracket);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('AI did not return JSON');
  }

  const slice = text.slice(start, end + 1);

  try {
    return JSON.parse(slice);
  } catch (err) {
    const wrapped = new Error('AI returned malformed JSON');
    wrapped.status = 502;
    wrapped.raw = raw.slice(0, 500);
    throw wrapped;
  }
}