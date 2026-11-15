import express from 'express';
import { requireAdminAuth } from '../middleware/auth.js';
import {
  createAdminVideo,
  updateAdminVideo,
  deleteAdminVideo,
  createAdminArticle,
  deleteAdminArticle
} from '../controllers/academyController.js';

const router = express.Router();

// Videos management
router.post('/videos', requireAdminAuth, createAdminVideo);
router.put('/videos/:id', requireAdminAuth, updateAdminVideo);
router.delete('/videos/:id', requireAdminAuth, deleteAdminVideo);

// Articles management
router.post('/articles', requireAdminAuth, createAdminArticle);
router.delete('/articles/:id', requireAdminAuth, deleteAdminArticle);

export default router;

