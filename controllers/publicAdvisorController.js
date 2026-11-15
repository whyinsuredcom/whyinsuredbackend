import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { advisorsData, getActiveAdvisors, getAdvisorBySlug } from '../data/advisorsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REVIEWS_FILE = path.join(__dirname, '../data/advisorReviews.json');

/**
 * Helper to safely read reviews from JSON storage
 */
function readReviewsFromFile() {
  try {
    if (!fs.existsSync(REVIEWS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(REVIEWS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading advisorReviews.json:', err);
    return [];
  }
}

/**
 * Helper to safely write reviews to JSON storage
 */
function writeReviewsToFile(reviews) {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing advisorReviews.json:', err);
  }
}

/**
 * GET /api/public/advisors
 * Retrieve all active advisors
 */
export const getPublicAdvisors = async (req, res) => {
  try {
    const list = getActiveAdvisors();
    return res.json({
      success: true,
      data: list,
      count: list.length
    });
  } catch (error) {
    console.error('Error fetching public advisors:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve advisors'
    });
  }
};

/**
 * GET /api/public/advisors/:slug
 * Retrieve single advisor by their URL slug
 */
export const getPublicAdvisorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Advisor slug is required'
      });
    }

    const advisor = getAdvisorBySlug(slug);
    if (!advisor) {
      return res.status(404).json({
        success: false,
        error: `Advisor with slug "${slug}" not found`
      });
    }

    return res.json({
      success: true,
      data: advisor
    });
  } catch (error) {
    console.error('Error fetching advisor by slug:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve advisor details'
    });
  }
};

/**
 * GET /api/public/advisors/:slug/reviews
 * Retrieve genuine submitted reviews for an advisor
 */
export const getPublicAdvisorReviews = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ success: false, error: 'Slug is required' });
    }
    const cleanSlug = String(slug).toLowerCase().trim();
    const all = readReviewsFromFile();
    const filtered = all.filter(
      (r) => String(r.advisorSlug).toLowerCase().trim() === cleanSlug
    );
    return res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Error fetching advisor reviews:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve advisor reviews'
    });
  }
};

/**
 * POST /api/public/advisors/:slug/reviews
 * Submit a genuine client review for an advisor
 */
export const submitPublicAdvisorReview = async (req, res) => {
  try {
    const { slug } = req.params;
    const { authorName, rating, comment, city, id, createdAt, dateFormatted } = req.body;

    if (!slug) {
      return res.status(400).json({ success: false, error: 'Advisor slug is required' });
    }

    const cleanName = (authorName || '').trim();
    if (cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Author name must be at least 2 characters' });
    }

    const numericRating = Math.max(1, Math.min(5, Math.round(Number(rating))));
    if (!numericRating || isNaN(numericRating)) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const cleanComment = (comment || '').trim();
    if (cleanComment.length < 5) {
      return res.status(400).json({ success: false, error: 'Review text must be at least 5 characters' });
    }

    const newReview = {
      id: id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      advisorSlug: String(slug).toLowerCase().trim(),
      authorName: cleanName,
      rating: numericRating,
      comment: cleanComment,
      city: (city || '').trim() || 'India',
      createdAt: createdAt || new Date().toISOString(),
      dateFormatted:
        dateFormatted ||
        new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
    };

    const all = readReviewsFromFile();
    // Prevent duplicate submission with same ID
    const existingIndex = all.findIndex((r) => r.id === newReview.id);
    if (existingIndex === -1) {
      all.unshift(newReview);
      writeReviewsToFile(all);
    }

    return res.status(201).json({
      success: true,
      data: newReview
    });
  } catch (error) {
    console.error('Error submitting advisor review:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to record review'
    });
  }
};

export default {
  getPublicAdvisors,
  getPublicAdvisorBySlug,
  getPublicAdvisorReviews,
  submitPublicAdvisorReview
};
