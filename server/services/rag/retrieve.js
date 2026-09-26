import StudyMaterial from '../../models/StudyMaterial.js';

/**
 * Retrieves the top-K most relevant chunks from the user's study materials.
 *
 * Two-stage strategy:
 *  1. If a materialId is given, restrict search to that material.
 *  2. Otherwise search across all the user's materials.
 *
 * Ranking: simple keyword-overlap scoring (TF-like), boosted by
 * recency and presence in the title.
 *
 * This is intentionally simple and free. Later, this can be swapped
 * for embeddings + MongoDB Atlas Vector Search without changing
 * the calling code.
 */
export async function retrieveChunks({
  userId,
  query,
  materialId = null,
  topK = 5,
} = {}) {
  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return [];
  }

  const filter = { userId };
  if (materialId) filter._id = materialId;

  const materials = await StudyMaterial.find(filter)
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  if (materials.length === 0) return [];

  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const scored = [];

  for (const mat of materials) {
    const titleBoost = scoreText(mat.title || '', terms) * 2;

    for (const chunk of mat.chunks || []) {
      const score = scoreText(chunk.text, terms) + titleBoost * 0.3;
      if (score > 0) {
        scored.push({
          score,
          materialId: mat._id,
          materialTitle: mat.title,
          chunkIndex: chunk.index,
          text: chunk.text,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/* ---------- Helpers ---------- */

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3)
    .slice(0, 40); // cap query tokens
}

function scoreText(text, terms) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let score = 0;
  for (const t of terms) {
    /* Count occurrences of each term, weighted by length */
    const matches = lower.split(t).length - 1;
    if (matches > 0) {
      score += matches * (1 + Math.min(t.length, 10) * 0.1);
    }
  }
  return score;
}