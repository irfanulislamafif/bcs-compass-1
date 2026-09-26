import pdfParse from 'pdf-parse';
import { cleanText } from './clean.js';

/**
 * Extracts text from a PDF buffer.
 * Returns { text, pageCount, info }
 */
export async function extractPdfText(buffer) {
  const data = await pdfParse(buffer);
  const raw = data.text || '';
  return {
    text: cleanText(raw),
    pageCount: data.numpages || 0,
    info: data.info || {},
  };
}