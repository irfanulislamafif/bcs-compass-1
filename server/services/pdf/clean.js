/**
 * Normalizes PDF-extracted text:
 *  - Fix hyphenated line breaks
 *  - Collapse multiple spaces / newlines
 *  - Remove obvious page-number-only lines
 *  - Trim trailing whitespace
 */
export function cleanText(raw) {
  if (!raw || typeof raw !== "string") return "";

  let text = raw.replace(/\r\n/g, "\n");

  /* Join hyphenated line breaks ("consti-\ntution" → "constitution") */
  text = text.replace(/([A-Za-z])-\n([a-z])/g, "$1$2");

  /* Collapse 3+ newlines to double newline */
  text = text.replace(/\n{3,}/g, "\n\n");

  /* Collapse runs of spaces/tabs */
  text = text.replace(/[ \t]{2,}/g, " ");

  /* Remove lines that are just page numbers */
  text = text
    .split("\n")
    .filter((line) => !/^\s*\d{1,4}\s*$/.test(line))
    .join("\n");

  return text.trim();
}
