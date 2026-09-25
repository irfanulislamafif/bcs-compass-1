/**
 * Google Gemini provider with:
 *  - dynamic model discovery (cached for 1 hour)
 *  - automatic retry on 429/5xx
 *  - fallback chain across all available models
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/* ---------- Model discovery (cached) ---------- */

let cachedModels = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function discoverModels() {
  const now = Date.now();
  if (cachedModels && now < cacheExpiry) return cachedModels;

  const apiKey = process.env.AI_API_KEY;
  const res = await fetch(`${GEMINI_BASE}/models?key=${apiKey}`);
  if (!res.ok) throw new Error('Failed to list models');

  const data = await res.json();

  /* Keep only models that support generateContent AND are flash/pro */
  const all = (data.models || [])
    .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m) => m.name.replace('models/', ''))
    .filter((name) => /flash|pro/i.test(name))
    .filter((name) => !/vision|embedding|aqa/i.test(name));

  /* Preferred order: prefer the model from .env first, then newest-looking */
  const preferred = process.env.AI_MODEL;
  const sorted = [
    ...(preferred ? [preferred] : []),
    ...all.filter((m) => m !== preferred),
  ];

  cachedModels = sorted.slice(0, 6); // cap at 6 fallbacks
  cacheExpiry = now + CACHE_TTL_MS;

  console.log('📋 Available Gemini models:', cachedModels);
  return cachedModels;
}

/* ---------- Main export ---------- */

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES_PER_MODEL = 2;

export async function generateGemini({
  systemPrompt,
  userPrompt,
  maxOutputTokens = 2048,
  temperature = 0.4,
}) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    const err = new Error('AI_API_KEY is not set.');
    err.status = 503;
    throw err;
  }

  const models = await discoverModels();

  if (models.length === 0) {
    const err = new Error('No AI models are available for this API key.');
    err.status = 503;
    throw err;
  }

  const body = {
    systemInstruction: systemPrompt
      ? { parts: [{ text: systemPrompt }] }
      : undefined,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: 'application/json',
    },
  };

  let lastError = null;

  for (const model of models) {
    const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;

    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p) => p.text)
              .join('') || '';

          if (!text) {
            const err = new Error('AI provider returned an empty response.');
            err.status = 502;
            throw err;
          }

          if (attempt > 0) {
            console.log(`✅ ${model} succeeded on attempt ${attempt + 1}`);
          }
          return text;
        }

        const errText = await res.text().catch(() => '');
        const status = res.status;

        /* Non-retryable → skip to next model immediately */
        if (!RETRYABLE_STATUS.has(status) && status !== 404) {
          const err = new Error(
            `AI provider error (${status}). ${errText.slice(0, 200)}`
          );
          err.status = 502;
          throw err;
        }

        /* 404 = model retired → skip to next model */
        if (status === 404) {
          console.warn(`⚠️  ${model} not available, trying next...`);
          lastError = new Error(`Model ${model} unavailable`);
          lastError.status = 503;
          break;
        }

        /* Retryable → retry with backoff */
        if (attempt < MAX_RETRIES_PER_MODEL) {
          const waitMs = 1200 * Math.pow(2, attempt);
          console.warn(
            `⚠️  ${model} returned ${status}, retry in ${waitMs}ms`
          );
          await sleep(waitMs);
          lastError = new Error(
            `AI provider error (${status}). ${errText.slice(0, 200)}`
          );
          lastError.status = 503;
          continue;
        }

        /* Out of retries for this model → try next */
        console.warn(`⚠️  ${model} exhausted retries, trying next...`);
        lastError = new Error(
          `AI provider error (${status}). ${errText.slice(0, 200)}`
        );
        lastError.status = 503;
        break;
      } catch (fetchErr) {
        console.warn(`⚠️  ${model} network error: ${fetchErr.message}`);
        lastError = fetchErr;
        break;
      }
    }
  }

  const err = new Error(
    lastError?.message ||
      'AI provider is temporarily unavailable. Please try again in a moment.'
  );
  err.status = 503;
  throw err;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}