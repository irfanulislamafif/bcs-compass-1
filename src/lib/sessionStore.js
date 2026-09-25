// Small localStorage-backed helper. Stage 7 will replace this with API calls.

const KEYS = {
  mistakes: "bcs_compass_mistakes_v1",
  attempts: "bcs_compass_attempts_v1",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage might be full or disabled — ignore */
  }
}

/* ---------- Mistakes ---------- */

export function getMistakes() {
  return read(KEYS.mistakes, []);
}

/**
 * Record a mistake. If the question id already exists, we update it.
 * `entry` = { questionId, subjectId, topicId, at }
 */
export function recordMistake(entry) {
  const list = getMistakes();
  const idx = list.findIndex((m) => m.questionId === entry.questionId);
  if (idx === -1) {
    list.unshift({ ...entry, count: 1 });
  } else {
    list[idx] = { ...list[idx], ...entry, count: (list[idx].count || 1) + 1 };
  }
  write(KEYS.mistakes, list);
}

export function removeMistake(questionId) {
  const list = getMistakes().filter((m) => m.questionId !== questionId);
  write(KEYS.mistakes, list);
}

export function clearMistakes() {
  write(KEYS.mistakes, []);
}

/* ---------- Attempts (for progress) ---------- */

/**
 * `entry` = { questionId, subjectId, topicId, selected, isCorrect, timeSpentMs, at }
 */
export function recordAttempt(entry) {
  const list = read(KEYS.attempts, []);
  list.unshift(entry);
  // cap at 1000 entries so we don't blow up localStorage
  write(KEYS.attempts, list.slice(0, 1000));
}

export function getAttempts() {
  return read(KEYS.attempts, []);
}

export function clearAttempts() {
  write(KEYS.attempts, []);
}

/* ---------- Exam attempts ---------- */

const EXAMS_KEY = "bcs_compass_exams_v1";

/**
 * `entry` = {
 *   examConfig: { title, subjectId, topicId, difficulty, count, durationSec },
 *   results: [{ questionId, subjectId, topicId, selected, isCorrect, timeSpentMs }],
 *   score, total, accuracy, timeSpentMs, completedAt
 * }
 */
export function saveExamAttempt(entry) {
  const list = read(EXAMS_KEY, []);
  list.unshift(entry);
  write(EXAMS_KEY, list.slice(0, 100)); // keep last 100
}

export function getExamAttempts() {
  return read(EXAMS_KEY, []);
}

export function clearExamAttempts() {
  write(EXAMS_KEY, []);
}
/* ---------- Mistakes — enrichment helpers ---------- */

/**
 * Marks a mistake as "understood". We keep it in the list but with an
 * `understoodAt` timestamp, so we can filter it out later.
 */
export function markMistakeUnderstood(questionId) {
  const list = getMistakes();
  const idx = list.findIndex((m) => m.questionId === questionId);
  if (idx === -1) return;
  list[idx] = { ...list[idx], understoodAt: Date.now() };
  write(KEYS.mistakes, list);
}

export function unmarkMistakeUnderstood(questionId) {
  const list = getMistakes();
  const idx = list.findIndex((m) => m.questionId === questionId);
  if (idx === -1) return;
  const { understoodAt, ...rest } = list[idx];
  list[idx] = rest;
  write(KEYS.mistakes, list);
}