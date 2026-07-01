import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { router } from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// ── Security Middleware ──────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  'http://localhost:3000',
  'https://ss-beauty-parlour.vercel.app',
  'https://ss-beauty-parlour-git-main-vj07.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

// ── General Middleware ───────────────────────────────────────────────
app.use(compression());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Apply Rate Limiters ──────────────────────────────────────────────
app.use('/api', globalLimiter);
app.use('/api/v1/auth', authLimiter);

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ── Health Check ─────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'Glow Beauty Studio API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── 404 Handler ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, () => {
  logger.info(`🌸 Glow Beauty Studio API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
