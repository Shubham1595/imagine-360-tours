import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error';

export const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Build allowed CORS origins from env
const parseAllowedOrigins = (): string[] => {
  const origins = new Set<string>();

  // Add configured origins
  if (ENV.CORS_ORIGINS) {
    ENV.CORS_ORIGINS.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(o => origins.add(o));
  }

  if (ENV.FRONTEND_URL) {
    origins.add(ENV.FRONTEND_URL.trim());
  }

  // Include production domains by default for deployment readiness
  origins.add('https://www.imagine360tours.in');
  origins.add('https://imagine360tours.in');

  // Allow local development ports when not in strict production
  if (ENV.NODE_ENV !== 'production') {
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
    origins.add('http://localhost:3000');
  }

  return Array.from(origins);
};

const allowedOrigins = parseAllowedOrigins();

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isVercel = /^https:\/\/[a-z0-9-]+(\.vercel\.app|\.vercel\.app\/)$/.test(origin);

    if (
      allowedOrigins.includes(origin) ||
      isVercel ||
      (ENV.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS Error: Origin '${origin}' is not authorized.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Root greeting / API discovery
app.get('/', (req, res) => {
  res.json({
    name: 'Imagine 360 Tours API',
    tagline: 'See Your World From Every Angle',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Global error handler
app.use(errorHandler);
