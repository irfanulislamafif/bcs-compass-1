/**
 * System prompt shared by all BCS Compass AI tasks.
 * Enforces exam-focus, factual grounding, and output format.
 */
const SYSTEM_BASE = `You are an expert BCS (Bangladesh Civil Service) exam preparation assistant.
You help aspirants study efficiently by extracting exam-relevant information from
study material and generating practice content.

Rules you must always follow:
- Ground every claim in the supplied study material. Do not invent facts.
- If something is not in the material, do not include it.
- Focus on what is useful for the BCS exam, not general summary.
- Write the CONTENT (questions, options, explanations, notes, facts) in the requested OUTPUT LANGUAGE.
  If output language is 'bn', write in correct, formal Bangla (প্রমিত বাংলা) as used in official
  BCS question papers. If 'en', write in clear BCS-style English.
  If 'auto', match the language of the source material.
- The JSON KEYS must always be in English (e.g. "question", "options", "answer").
  Only the VALUES are translated to the output language.
- Always respond with valid JSON matching the requested schema. No prose outside JSON.
- Do not include markdown code fences in your response.`;

/**
 * Appends the language directive to any user prompt.
 */
function withLanguage(prompt, outputLanguage) {
  const langName =
    outputLanguage === 'bn'
      ? 'Bangla (বাংলা)'
      : outputLanguage === 'en'
      ? 'English'
      : 'the same language as the source material';
  return `${prompt}

OUTPUT LANGUAGE: ${langName}.
Write all question text, options, explanations, notes and facts in ${langName}.
Keep JSON keys in English.`;
}

/* ------------------------------------------------------------------ */
/*  Analyze                                                           */
/* ------------------------------------------------------------------ */

export const ANALYZE_PROMPT = {
  system: SYSTEM_BASE,
  user: (material, outputLanguage = 'auto') =>
    withLanguage(
      `Analyze the following study material for BCS exam preparation.

Return JSON matching this exact schema:

{
  "summary": "3-5 sentences summarizing what a BCS aspirant must know",
  "importantFacts": ["fact 1", "fact 2", "..."],
  "keyConcepts": [{ "name": "concept", "explanation": "1-2 sentences" }],
  "importantDates": [{ "date": "date", "event": "what happened" }],
  "importantNames": [{ "name": "person/organization", "role": "why they matter" }],
  "definitions": [{ "term": "term", "definition": "definition" }],
  "potentialExamPoints": ["point 1", "point 2", "..."],
  "thingsToMemorize": ["item 1", "item 2", "..."],
  "confusingAreas": ["area 1", "area 2", "..."]
}

Aim for 5-10 items per array where applicable. Prioritize exam relevance.

STUDY MATERIAL:
"""
${material}
"""`,
      outputLanguage
    ),
};

/* ------------------------------------------------------------------ */
/*  MCQ generation                                                    */
/* ------------------------------------------------------------------ */

export const MCQ_PROMPT = {
  system: SYSTEM_BASE,
  user: ({ material, count, difficulty, style, outputLanguage = 'auto' }) =>
    withLanguage(
      `Generate exactly ${count} BCS-style multiple-choice questions from the study material below.

Difficulty: ${difficulty}.
Question style: ${style}.

Return JSON matching this schema:

{
  "questions": [
    {
      "question": "the question text",
      "options": ["A text", "B text", "C text", "D text"],
      "answer": 0,
      "explanation": "brief reason the correct option is right",
      "difficulty": "easy | medium | hard",
      "topic": "short topic name"
    }
  ]
}

Strict rules:
- Exactly ${count} questions.
- Exactly 4 options per question.
- Exactly 1 correct answer (the "answer" field is the zero-based index).
- No ambiguous questions. No "all of the above" unless the source supports it.
- Every question must be answerable from the supplied material.
- Explanations must be one sentence, factual.

STUDY MATERIAL:
"""
${material}
"""`,
      outputLanguage
    ),
};

/* ------------------------------------------------------------------ */
/*  Written questions                                                 */
/* ------------------------------------------------------------------ */

export const WRITTEN_PROMPT = {
  system: SYSTEM_BASE,
  user: ({ material, count, outputLanguage = 'auto' }) =>
    withLanguage(
      `Generate ${count} written (descriptive) questions from the study material below.

Return JSON:

{
  "questions": [
    {
      "question": "the question",
      "type": "short | descriptive | analytical",
      "difficulty": "easy | medium | hard",
      "topic": "short topic name",
      "expectedPoints": ["point 1", "point 2", "point 3"]
    }
  ]
}

Use a mix of short, descriptive, and analytical questions.
Include 3-5 expected answer points per question.

STUDY MATERIAL:
"""
${material}
"""`,
      outputLanguage
    ),
};

/* ------------------------------------------------------------------ */
/*  Flashcards                                                        */
/* ------------------------------------------------------------------ */

export const FLASHCARD_PROMPT = {
  system: SYSTEM_BASE,
  user: ({ material, count, outputLanguage = 'auto' }) =>
    withLanguage(
      `Generate ${count} flashcards from the study material below.

Return JSON:

{
  "flashcards": [
    { "front": "question or term", "back": "concise answer", "topic": "short topic" }
  ]
}

Rules: front is a question or term, back is a factually-correct concise answer.
Every card must be answerable from the material.

STUDY MATERIAL:
"""
${material}
"""`,
      outputLanguage
    ),
};

/* ------------------------------------------------------------------ */
/*  Revision notes                                                    */
/* ------------------------------------------------------------------ */

export const NOTES_PROMPT = {
  system: SYSTEM_BASE,
  user: (material, outputLanguage = 'auto') =>
    withLanguage(
      `Generate concise BCS exam revision notes from the study material below.

Return JSON:

{
  "keyFacts": ["..."],
  "definitions": [{ "term": "term", "definition": "..." }],
  "importantNames": [{ "name": "name", "role": "..." }],
  "importantDates": [{ "date": "date", "event": "..." }],
  "importantConcepts": [{ "name": "concept", "explanation": "..." }],
  "commonConfusion": ["..."],
  "quickRevision": ["short bullet", "..."]
}

Prioritize memorizable, exam-relevant content.

STUDY MATERIAL:
"""
${material}
"""`,
      outputLanguage
    ),
};

/* ------------------------------------------------------------------ */
/*  Important facts                                                   */
/* ------------------------------------------------------------------ */

export const FACTS_PROMPT = {
  system: SYSTEM_BASE,
  user: (material, outputLanguage = 'auto') =>
    withLanguage(
      `Extract the most important facts to memorize from the study material below.

Return JSON:

{
  "facts": [
    { "fact": "one clear sentence", "topic": "short topic", "importance": "high | medium | low" }
  ]
}

Return 10-20 facts. Only include what a BCS candidate must know.

STUDY MATERIAL:
"""
${material}
"""`,
      outputLanguage
    ),
};

/* ------------------------------------------------------------------ */
/*  What to memorize                                                  */
/* ------------------------------------------------------------------ */

export const MEMORIZE_PROMPT = {
  system: SYSTEM_BASE,
  user: (material, outputLanguage = 'auto') =>
    withLanguage(
      `From the study material below, list only the things a BCS aspirant MUST memorize.

Return JSON:

{
  "items": [
    { "type": "date | name | list | formula | definition", "value": "the item to memorize", "why": "one-line reason" }
  ]
}

Return 8-20 items. Skip anything that doesn't need memorization.

STUDY MATERIAL:
"""
${material}
"""`,
      outputLanguage
    ),
};