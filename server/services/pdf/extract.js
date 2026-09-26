import { extractText } from "unpdf";
import { cleanText } from "./clean.js";

/**
 * Extracts text from a PDF buffer using unpdf.
 * unpdf is ESM-native — no createRequire hacks needed.
 */
export async function extractPdfText(buffer) {
  const { text, totalPages } = await extractText(new Uint8Array(buffer), {
    mergePages: true,
  });

  return {
    text: cleanText(text || ""),
    pageCount: totalPages || 0,
    info: {},
  };
}
