import { getAttempts, getMistakes, getExamAttempts } from './sessionStore.js';
import { demoSubjects, getSubjectById, getTopicById } from '../data/demoData.jsx';

/* ------------------------------------------------------------------ */
/*  Overall stats                                                     */
/* ------------------------------------------------------------------ */

export function getOverallStats() {
  const attempts = getAttempts();
  const exams = getExamAttempts();

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const accuracy = totalAttempts
    ? Math.round((totalCorrect / totalAttempts) * 100)
    : 0;

  const examsCompleted = exams.length;

  const examTimeMs = exams.reduce((s, e) => s + (e.timeSpentMs || 0), 0);
  const practiceTimeMs = attempts.length * 30 * 1000;
  const studyTimeMs = examTimeMs + practiceTimeMs;

  return {
    totalAttempts,
    totalCorrect,
    accuracy,
    examsCompleted,
    studyTimeMs,
  };
}

/* ------------------------------------------------------------------ */
/*  Subject-level                                                     */
/* ------------------------------------------------------------------ */

export function getSubjectStats() {
  const attempts = getAttempts();

  return demoSubjects.map((s) => {
    const subjAttempts = attempts.filter((a) => a.subjectId === s.id);
    const total = subjAttempts.length;
    const correct = subjAttempts.filter((a) => a.isCorrect).length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    return {
      subjectId: s.id,
      name: s.name,
      total,
      correct,
      accuracy,
      progress: Math.min(100, Math.round((total / Math.max(1, s.questionsAttempted)) * 100)),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Topic-level                                                       */
/* ------------------------------------------------------------------ */

export function getTopicStats() {
  const attempts = getAttempts();
  const map = {};

  for (const a of attempts) {
    const key = `${a.subjectId}::${a.topicId}`;
    if (!map[key]) {
      map[key] = {
        subjectId: a.subjectId,
        topicId: a.topicId,
        total: 0,
        correct: 0,
      };
    }
    map[key].total += 1;
    if (a.isCorrect) map[key].correct += 1;
  }

  return Object.values(map).map((t) => {
    const subject = getSubjectById(t.subjectId);
    const topic = getTopicById(t.subjectId, t.topicId)?.topic;
    const accuracy = t.total ? Math.round((t.correct / t.total) * 100) : 0;
    return {
      ...t,
      subjectName: subject?.name || t.subjectId,
      topicName: topic?.name || t.topicId,
      accuracy,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Weak / strong topics                                              */
/* ------------------------------------------------------------------ */

export function getWeakTopics({ minAttempts = 3, threshold = 60 } = {}) {
  return getTopicStats()
    .filter((t) => t.total >= minAttempts && t.accuracy < threshold)
    .sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.total - a.total;
    });
}

export function getStrongTopics({ minAttempts = 3, threshold = 75 } = {}) {
  return getTopicStats()
    .filter((t) => t.total >= minAttempts && t.accuracy >= threshold)
    .sort((a, b) => b.accuracy - a.accuracy);
}

/* ------------------------------------------------------------------ */
/*  Recent activity                                                   */
/* ------------------------------------------------------------------ */

export function getRecentActivity({ days = 14 } = {}) {
  const attempts = getAttempts();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { date: key, attempts: 0, correct: 0 };
  }

  for (const a of attempts) {
    if (!a.at || a.at < cutoff) continue;
    const key = new Date(a.at).toISOString().slice(0, 10);
    if (!buckets[key]) continue;
    buckets[key].attempts += 1;
    if (a.isCorrect) buckets[key].correct += 1;
  }

  return Object.values(buckets).map((b) => ({
    ...b,
    accuracy: b.attempts ? Math.round((b.correct / b.attempts) * 100) : 0,
    label: b.date.slice(5),
  }));
}

/* ------------------------------------------------------------------ */
/*  Exam history                                                      */
/* ------------------------------------------------------------------ */

export function getExamHistory() {
  return getExamAttempts().map((e) => {
    const subjectName = e.examConfig?.subjectId
      ? getSubjectById(e.examConfig.subjectId)?.name
      : 'Mixed';
    return {
      id: e.completedAt,
      completedAt: e.completedAt,
      title: `${subjectName} Exam`,
      subject: subjectName,
      score: e.score,
      total: e.total,
      accuracy: e.accuracy,
      timeSpentMs: e.timeSpentMs,
      autoSubmitted: !!e.autoSubmitted,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Mistakes summary                                                  */
/* ------------------------------------------------------------------ */

export function getMistakesSummary() {
  const mistakes = getMistakes();
  const bySubject = {};
  const byTopic = {};

  for (const m of mistakes) {
    bySubject[m.subjectId] = (bySubject[m.subjectId] || 0) + 1;
    const key = `${m.subjectId}::${m.topicId}`;
    byTopic[key] = (byTopic[key] || 0) + 1;
  }

  return {
    total: mistakes.length,
    bySubject,
    byTopic,
  };
}