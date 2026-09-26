import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import {
  uploadMaterial,
  listMaterials,
  getMaterial,
  deleteMaterial,
} from '../controllers/studyMaterialController.js';

const router = express.Router();

/* Keep the file in memory — no disk writes */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.use(requireAuth);

router.post('/upload', upload.single('file'), uploadMaterial);
router.get('/', listMaterials);
router.get('/:id', getMaterial);
router.delete('/:id', deleteMaterial);

export default router;