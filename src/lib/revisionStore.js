// localStorage-backed revision scheduler.
// Later: replace with API calls to /api/revision.

const KEY = 'bcs_compass_revision_v1';

/* Interval schedule in days */
export const REVISION_INTERVALS = [0, 1, 3, 7, 14, 30];

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

/** Returns all revision items. */
export function getAllRevisions() {
  return read();
}

/**
 * Schedules a topic for revision at all intervals.
 * `entry` = { subjectId, topicId, subjectName, topicName }
 * Stores one item per interval step (5 total after Day 0).
 */
export function scheduleRevision(entry) {
  const now = Date.now();
  const items = read();

  /* Skip scheduling if already scheduled for this topic */
  const existing = items.filter(
    (r) => r.subjectId === entry.subjectId && r.topicId === entry.topicId
  );
  if (existing.length > 0) return items;

  const newItems = REVISION_INTERVALS.map((days, idx) => ({
    id: `${entry.subjectId}::${entry.topicId}::d${days}`,
    subjectId: entry.subjectId,
    topicId: entry.topicId,
    subjectName: entry.subjectName,
    topicName: entry.topicName,
    intervalDays: days,
    step: idx, // 0, 1, 2, 3, 4, 5
    dueAt: now + days * 24 * 60 * 60 * 1000,
    completedAt: null,
    createdAt: now,
  }));

  write([...newItems, ...items]);
  return [...newItems, ...items];
}

export function markRevisionComplete(id) {
  const items = read();
  const idx = items.findIndex((r) => r.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], completedAt: Date.now() };
  write(items);
}

export function unmarkRevision(id) {
  const items = read();
  const idx = items.findIndex((r) => r.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], completedAt: null };
  write(items);
}

export function rescheduleRevision(id, daysFromNow) {
  const items = read();
  const idx = items.findIndex((r) => r.id === id);
  if (idx === -1) return;
  items[idx] = {
    ...items[idx],
    dueAt: Date.now() + daysFromNow * 24 * 60 * 60 * 1000,
    completedAt: null,
  };
  write(items);
}

export function removeRevision(id) {
  write(read().filter((r) => r.id !== id));
}

export function clearRevisions() {
  write([]);
}

/* ---------- Selectors ---------- */

export function isRevisionDue(item, now = Date.now()) {
  return !item.completedAt && item.dueAt <= now;
}

export function isRevisionUpcoming(item, now = Date.now()) {
  return !item.completedAt && item.dueAt > now;
}

export function isRevisionCompleted(item) {
  return !!item.completedAt;
}

export function getDueToday() {
  const now = Date.now();
  return read()
    .filter((r) => !r.completedAt && r.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt);
}

export function getUpcoming() {
  const now = Date.now();
  return read()
    .filter((r) => !r.completedAt && r.dueAt > now)
    .sort((a, b) => a.dueAt - b.dueAt);
}

export function getCompletedRevisions() {
  return read()
    .filter((r) => r.completedAt)
    .sort((a, b) => b.completedAt - a.completedAt);
}

/** Unique topics with any revision item (for dashboard counters). */
export function getRevisionCounts() {
  const items = read();
  const due = items.filter((r) => !r.completedAt && r.dueAt <= Date.now());
  const upcoming = items.filter((r) => !r.completedAt && r.dueAt > Date.now());
  const completed = items.filter((r) => r.completedAt);
  return {
    total: items.length,
    due: due.length,
    upcoming: upcoming.length,
    completed: completed.length,
  };
}