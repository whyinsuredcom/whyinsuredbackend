import express from 'express';
import { requireAdminAuth } from '../middleware/auth.js';
import * as authCtrl from '../controllers/adminAuthController.js';
import * as dashboardCtrl from '../controllers/adminDashboardController.js';
import * as companyCtrl from '../controllers/adminCompanyController.js';
import * as planCtrl from '../controllers/adminPlanController.js';
import * as uploadCtrl from '../controllers/adminUploadController.js';

const router = express.Router();

// ===========================================================================
// 1. AUTHENTICATION (PUBLIC / PROTECTED)
// ===========================================================================
router.post('/auth/login', authCtrl.login);
router.post('/login', authCtrl.login); // Convenience alias
router.get('/auth/verify', authCtrl.verifySession);
router.get('/verify', authCtrl.verifySession); // Convenience alias
router.post('/auth/logout', authCtrl.logout);
router.post('/logout', authCtrl.logout);
router.post('/auth/change-password', requireAdminAuth, authCtrl.changePassword);

// ===========================================================================
// 2. DASHBOARD STATISTICS
// ===========================================================================
router.get('/dashboard', requireAdminAuth, dashboardCtrl.getDashboardStats);
router.get('/dashboard/stats', requireAdminAuth, dashboardCtrl.getDashboardStats);

// ===========================================================================
// 3. COMPANIES MANAGEMENT
// ===========================================================================
router.get('/companies', requireAdminAuth, companyCtrl.getAllCompanies);
router.get('/companies/:id', requireAdminAuth, companyCtrl.getCompanyById);
router.post('/companies', requireAdminAuth, companyCtrl.createCompany);
router.put('/companies/:id', requireAdminAuth, companyCtrl.updateCompany);
router.delete('/companies/:id', requireAdminAuth, companyCtrl.deleteCompany);
router.patch('/companies/:id/status', requireAdminAuth, companyCtrl.toggleCompanyStatus);
router.patch('/companies/reorder', requireAdminAuth, companyCtrl.reorderCompanies);

// ===========================================================================
// 4. PLANS MANAGEMENT
// ===========================================================================
router.get('/plans', requireAdminAuth, planCtrl.getAllPlans);
router.get('/plans/:id', requireAdminAuth, planCtrl.getPlanById);
router.post('/plans', requireAdminAuth, planCtrl.createPlan);
router.put('/plans/:id', requireAdminAuth, planCtrl.updatePlan);
router.delete('/plans/:id', requireAdminAuth, planCtrl.deletePlan);
router.patch('/plans/:id/status', requireAdminAuth, planCtrl.togglePlanStatus);
router.patch('/plans/reorder', requireAdminAuth, planCtrl.reorderPlans);

// Subsections: Variants
router.get('/plans/:planId/variants', requireAdminAuth, planCtrl.getVariants);
router.post('/plans/:planId/variants', requireAdminAuth, planCtrl.createVariant);
router.put('/variants/:id', requireAdminAuth, planCtrl.updateVariant);
router.delete('/variants/:id', requireAdminAuth, planCtrl.deleteVariant);
router.patch('/variants/reorder', requireAdminAuth, planCtrl.reorderVariants);

// Subsections: Report Card
router.get('/plans/:planId/report-card', requireAdminAuth, planCtrl.getReportCard);
router.post('/plans/:planId/report-card', requireAdminAuth, planCtrl.createReportCardItem);
router.put('/report-card/:id', requireAdminAuth, planCtrl.updateReportCardItem);
router.delete('/report-card/:id', requireAdminAuth, planCtrl.deleteReportCardItem);
router.patch('/report-card/reorder', requireAdminAuth, planCtrl.reorderReportCard);

// Subsections: Company Strength
router.get('/plans/:planId/company-strength', requireAdminAuth, planCtrl.getCompanyStrength);
router.post('/plans/:planId/company-strength', requireAdminAuth, planCtrl.createCompanyStrengthItem);
router.put('/company-strength/:id', requireAdminAuth, planCtrl.updateCompanyStrengthItem);
router.delete('/company-strength/:id', requireAdminAuth, planCtrl.deleteCompanyStrengthItem);
router.patch('/company-strength/reorder', requireAdminAuth, planCtrl.reorderCompanyStrength);

// Subsections: Policy Benefits
router.get('/plans/:planId/benefits', requireAdminAuth, planCtrl.getBenefits);
router.post('/plans/:planId/benefits', requireAdminAuth, planCtrl.createBenefit);
router.put('/benefits/:id', requireAdminAuth, planCtrl.updateBenefit);
router.delete('/benefits/:id', requireAdminAuth, planCtrl.deleteBenefit);
router.patch('/benefits/:id/status', requireAdminAuth, planCtrl.toggleBenefitStatus);
router.patch('/benefits/reorder', requireAdminAuth, planCtrl.reorderBenefits);

// Subsections: Limitations & Waiting Periods
router.get('/plans/:planId/limitations', requireAdminAuth, planCtrl.getLimitations);
router.post('/plans/:planId/limitations', requireAdminAuth, planCtrl.createLimitation);
router.put('/limitations/:id', requireAdminAuth, planCtrl.updateLimitation);
router.delete('/limitations/:id', requireAdminAuth, planCtrl.deleteLimitation);
router.patch('/limitations/reorder', requireAdminAuth, planCtrl.reorderLimitations);

// Subsections: Must Know
router.get('/plans/:planId/must-know', requireAdminAuth, planCtrl.getMustKnow);
router.post('/plans/:planId/must-know', requireAdminAuth, planCtrl.createMustKnowItem);
router.put('/must-know/:id', requireAdminAuth, planCtrl.updateMustKnowItem);
router.delete('/must-know/:id', requireAdminAuth, planCtrl.deleteMustKnowItem);
router.patch('/must-know/reorder', requireAdminAuth, planCtrl.reorderMustKnow);

// Subsections: Best Suited / Perfect For
router.get('/plans/:planId/best-suited', requireAdminAuth, planCtrl.getBestSuited);
router.post('/plans/:planId/best-suited', requireAdminAuth, planCtrl.createBestSuitedItem);
router.put('/best-suited/:id', requireAdminAuth, planCtrl.updateBestSuitedItem);
router.delete('/best-suited/:id', requireAdminAuth, planCtrl.deleteBestSuitedItem);
router.patch('/best-suited/reorder', requireAdminAuth, planCtrl.reorderBestSuited);

// Flat Subsections POST Convenience Routes (when plan_id is in request body)
router.post('/variants', requireAdminAuth, planCtrl.createVariant);
router.post('/report-card', requireAdminAuth, planCtrl.createReportCardItem);
router.post('/company-strength', requireAdminAuth, planCtrl.createCompanyStrengthItem);
router.post('/benefits', requireAdminAuth, planCtrl.createBenefit);
router.post('/limitations', requireAdminAuth, planCtrl.createLimitation);
router.post('/must-know', requireAdminAuth, planCtrl.createMustKnowItem);
router.post('/best-suited', requireAdminAuth, planCtrl.createBestSuitedItem);

// ===========================================================================
// 5. PLAN & CONTENT MEDIA UPLOAD (ICON & VIDEO DIRECT UPLOAD)
// ===========================================================================
router.post('/upload', requireAdminAuth, uploadCtrl.upload.single('file'), uploadCtrl.handleUpload);

export default router;
