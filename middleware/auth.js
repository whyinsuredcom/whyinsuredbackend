import db from '../database/db.js';
import { verifySignedToken } from '../controllers/adminAuthController.js';

export const requireAdminAuth = async (req, res, next) => {
  try {
    const tokenHeader = req.headers['x-admin-token'];
    const authHeader = req.headers['authorization'];

    let token = tokenHeader;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    const payload = verifySignedToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired admin authentication session'
      });
    }

    // If session has a valid database admin userId, verify account is active
    if (payload.userId && payload.userId !== 'admin-env-fallback') {
      const admin = await db.admins.findById(payload.userId);
      if (admin && admin.status === 'inactive') {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Admin user account is inactive'
        });
      }
    }

    req.adminUser = payload;
    next();
  } catch (error) {
    console.error('Error in requireAdminAuth middleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication verification error'
    });
  }
};

