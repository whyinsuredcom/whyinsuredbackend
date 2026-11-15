import express from 'express';
import { getPublicCompanies, getPublicPlanDetail } from '../controllers/publicPlanController.js';
import {
  getPublicAdvisors,
  getPublicAdvisorBySlug,
  getPublicAdvisorReviews,
  submitPublicAdvisorReview
} from '../controllers/publicAdvisorController.js';

const router = express.Router();

// GET /api/public/companies - Active companies with plans
router.get('/companies', getPublicCompanies);

// GET /api/public/plans/:companySlug/:planSlug - Full public plan details
router.get('/plans/:companySlug/:planSlug', getPublicPlanDetail);

// GET /api/public/plans/:planSlug - Alternate direct plan slug endpoint
router.get('/plans/:planSlug', getPublicPlanDetail);

// GET /api/public/advisors - Active advisors list
router.get('/advisors', getPublicAdvisors);

// GET /api/public/advisors/:slug - Specific advisor profile by slug
router.get('/advisors/:slug', getPublicAdvisorBySlug);

// Reviews endpoints
router.get('/advisors/:slug/reviews', getPublicAdvisorReviews);
router.post('/advisors/:slug/reviews', submitPublicAdvisorReview);

export default router;
