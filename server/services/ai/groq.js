/**
 * Groq provider — uses the OpenAI-compatible REST API.
 * Endpoint: https://api.groq.com/openai/v1/chat/completions
 * Docs: https://console.groq.com/docs/api-reference
 */

const GROQ_BASE = 'https://api.groq.com/openai/v1';

export async function generateGroq({
  systemPrompt,
  userPrompt,
  maxOutputTokens = 2048,
  temperature = 0.4,
  retries = 2,
}) {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

  const body = {
    model,
    messages: [
      systemPrompt
        ? { role: 'system', content: systemPrompt }
        : null,
      { role: 'user', content: userPrompt },
    ].filter(Boolean),
    temperature,
    max_tokens: maxOutputTokens,
    response_format: { type: 'json_object' },
  };

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    attempt += 1;

    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '';
      if (!text) {
        const err = new Error('Groq returned an empty response.');
        err.status = 502;
        throw err;
      }
      return text;
    }

    const errText = await res.text().catch(() => '');
    const status = res.status;

    // Retry on transient errors (429 = rate limit, 5xx = overloaded)
    if ((status === 429 || status >= 500) && attempt <= retries) {
      const waitMs = 1500 * attempt;
      console.warn(
        `Groq ${status} on attempt ${attempt}, retrying in ${waitMs}ms...`
      );
      await new Promise((r) => setTimeout(r, waitMs));
      lastError = `Groq ${status}: ${errText.slice(0, 200)}`;
      continue;
    }

    const err = new Error(
      `AI provider error (${status}). ${errText.slice(0, 200)}`
    );
    err.status = 502;
    throw err;
  }

  const err = new Error(`AI provider unavailable. ${lastError || ''}`);
  err.status = 503;
  throw err;
}