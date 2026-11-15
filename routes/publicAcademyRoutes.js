import express from 'express';
import {
  getPublicCategories,
  getPublicVideos,
  getPublicVideoById,
  getPublicArticles,
  getPublicArticleBySlug
} from '../controllers/academyController.js';

const router = express.Router();

// GET /api/public/academy/categories
router.get('/categories', getPublicCategories);

// GET /api/public/academy/videos
router.get('/videos', getPublicVideos);

// GET /api/public/academy/videos/:id
router.get('/videos/:id', getPublicVideoById);

// GET /api/public/academy/articles
router.get('/articles', getPublicArticles);

// GET /api/public/academy/articles/:slug
router.get('/articles/:slug', getPublicArticleBySlug);

export default router;

