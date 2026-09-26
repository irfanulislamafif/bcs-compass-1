import StudyMaterial from '../models/StudyMaterial.js';
import { extractPdfText } from '../services/pdf/extract.js';
import { chunkText } from '../services/pdf/chunk.js';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_TEXT_CHARS = 100;

/* POST /api/materials/upload
 * multipart/form-data with a single "file" field, plus optional "title".
 */
export async function uploadMaterial(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    if (req.file.size > MAX_FILE_BYTES) {
      return res.status(400).json({ message: 'File is larger than 10 MB.' });
    }
    const mime = req.file.mimetype || '';
    if (mime !== 'application/pdf' && !req.file.originalname.endsWith('.pdf')) {
      return res.status(400).json({ message: 'Only PDF files are supported.' });
    }

    const title =
      (req.body?.title && String(req.body.title).trim().slice(0, 120)) ||
      req.file.originalname.replace(/\.pdf$/i, '').slice(0, 120) ||
      'Untitled PDF';

    /* Extract */
    let extracted;
    try {
      extracted = await extractPdfText(req.file.buffer);
    } catch (e) {
      return res.status(422).json({
        message:
          'Could not read this PDF. It may be scanned (image-only) or corrupted.',
      });
    }

    if (!extracted.text || extracted.text.length < MIN_TEXT_CHARS) {
      return res.status(422).json({
        message:
          'This PDF has very little extractable text. Scanned PDFs are not supported yet.',
      });
    }

    /* Chunk */
    const chunks = chunkText(extracted.text, {
      targetChars: 1200,
      overlapChars: 200,
    });

    /* Language guess (very rough) */
    const bnChars = (extracted.text.match(/[\u0980-\u09FF]/g) || []).length;
    const enChars = (extracted.text.match(/[A-Za-z]/g) || []).length;
    let language = 'en';
    if (bnChars > enChars) language = 'bn';
    else if (bnChars > 0) language = 'mixed';

    const doc = await StudyMaterial.create({
      userId: req.user._id,
      title,
      originalFilename: req.file.originalname,
      mimeType: mime,
      sizeBytes: req.file.size,
      text: extracted.text,
      textLength: extracted.text.length,
      chunks,
      pageCount: extracted.pageCount,
      language,
      status: 'ready',
    });

    res.status(201).json({
      ok: true,
      material: {
        _id: doc._id,
        title: doc.title,
        textLength: doc.textLength,
        pageCount: doc.pageCount,
        chunkCount: doc.chunks.length,
        language: doc.language,
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/* GET /api/materials */
export async function listMaterials(req, res, next) {
  try {
    const items = await StudyMaterial.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select(
        'title originalFilename sizeBytes textLength pageCount language status createdAt'
      );
    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
}

/* GET /api/materials/:id */
export async function getMaterial(req, res, next) {
  try {
    const doc = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!doc) return res.status(404).json({ message: 'Material not found.' });

    /* Return a trimmed version — text can be large */
    res.json({
      ok: true,
      material: {
        _id: doc._id,
        title: doc.title,
        originalFilename: doc.originalFilename,
        sizeBytes: doc.sizeBytes,
        textLength: doc.textLength,
        pageCount: doc.pageCount,
        language: doc.language,
        chunkCount: doc.chunks.length,
        createdAt: doc.createdAt,
        preview: doc.text.slice(0, 2000),
      },
    });
  } catch (err) {
    next(err);
  }
}

/* DELETE /api/materials/:id */
export async function deleteMaterial(req, res, next) {
  try {
    const doc = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!doc) return res.status(404).json({ message: 'Material not found.' });

    await doc.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}