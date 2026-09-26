/**
 * Simple sliding-window chunker.
 * Splits text into overlapping chunks of ~targetChars characters,
 * trying to break on paragraph / sentence boundaries.
 */
export function chunkText(
  text,
  { targetChars = 1200, overlapChars = 200 } = {}
) {
  if (!text || typeof text !== 'string') return [];
  const clean = text.trim();
  if (clean.length <= targetChars) {
    return [{ index: 0, text: clean, charCount: clean.length }];
  }

  const chunks = [];
  let start = 0;
  let idx = 0;

  while (start < clean.length) {
    let end = Math.min(start + targetChars, clean.length);

    /* Prefer to break at paragraph */
    if (end < clean.length) {
      const paragraphBreak = clean.lastIndexOf('\n\n', end);
      if (paragraphBreak > start + targetChars * 0.6) {
        end = paragraphBreak;
      } else {
        /* Fallback: break at sentence end */
        const sentenceBreak = Math.max(
          clean.lastIndexOf('. ', end),
          clean.lastIndexOf('। ', end) // Bangla danda
        );
        if (sentenceBreak > start + targetChars * 0.6) {
          end = sentenceBreak + 1;
        }
      }
    }

    const slice = clean.slice(start, end).trim();
    if (slice.length > 0) {
      chunks.push({ index: idx, text: slice, charCount: slice.length });
      idx += 1;
    }

    if (end >= clean.length) break;

    start = Math.max(end - overlapChars, start + 1);
  }

  return chunks;
}