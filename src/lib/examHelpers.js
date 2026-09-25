import { demoQuestions } from '../data/demoQuestions.jsx';

/**
 * Build a list of questions for an exam based on config.
 * config: {
 *   subjectId?: string,
 *   topicIds?: string[],   // if omitted, use all topics for subject
 *   difficulty?: 'any' | 'easy' | 'medium' | 'hard',
 *   count: number,
 *   shuffle?: boolean (default true)
 * }
 */
export function buildExamQuestions(config) {
  const {
    subjectId,
    topicIds,
    difficulty = 'any',
    count = 20,
    shuffle = true,
  } = config || {};

  let pool = demoQuestions.slice();

  if (subjectId) pool = pool.filter((q) => q.subjectId === subjectId);
  if (topicIds?.length) pool = pool.filter((q) => topicIds.includes(q.topicId));
  if (difficulty && difficulty !== 'any') {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }

  if (shuffle) pool = pool.sort(() => Math.random() - 0.5);

  return pool.slice(0, count);
}

/** Format seconds → "MM:SS" */
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

/** Reasonable default time given question count */
export function suggestedDurationMinutes(count) {
  // ~1 minute per question, minimum 5 minutes
  return Math.max(5, count);
}