import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import optimaSecurePlusRoutes from './routes/optimaSecurePlusRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import aiChatRoutes from './routes/aiChatRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import { seedDatabase } from './database/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const ALLOWED_ORIGINS = [
  'https://why-insured.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean) : [])
];

// Auto-seed database with Optima Secure+ data if not already seeded
seedDatabase();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman, server-side fetch)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list, localhost development, or why-insured preview domains
    const isAllowed =
      ALLOWED_ORIGINS.includes(origin) ||
      origin === 'https://why-insured.vercel.app' ||
      origin === 'http://localhost:5173' ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /^https:\/\/why-insured(-[a-z0-9-]+)?\.vercel\.app$/.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }
    
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WHYINSURED Backend API',
    time: new Date().toISOString()
  });
});

// Mount Admin Auth APIs
app.use('/api/admin', adminAuthRoutes);

// Mount Optima Secure+ APIs
app.use('/api/optima-secure-plus', optimaSecurePlusRoutes);

// Mount AI Chat Assistant APIs
app.use('/api/ai', aiChatRoutes);

// Mount Policy Upload & Analysis APIs
app.use('/api/policy', policyRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start server (only when not in Vercel Serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 WHYINSURED API Server running on port ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api/optima-secure-plus`);
    console.log(`🔒 Admin Auth Header: x-admin-token: ${process.env.ADMIN_SECRET_KEY || 'whyinsured-admin-secret-2026'}`);
    console.log(`====================================================`);
  });
}

export default app;
