import express from 'express';
import { getPublicCompanies, getPublicPlanDetail } from '../controllers/publicPlanController.js';

const router = express.Router();

// GET /api/public/companies - Active companies with plans
router.get('/companies', getPublicCompanies);

// GET /api/public/plans/:companySlug/:planSlug - Full public plan details
router.get('/plans/:companySlug/:planSlug', getPublicPlanDetail);

// GET /api/public/plans/:planSlug - Alternate direct plan slug endpoint
router.get('/plans/:planSlug', getPublicPlanDetail);

export default router;
