import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is required in production.');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL environment variable is required in production.');
    process.exit(1);
  }
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || (isProd ? '' : 'mysql://root@localhost:3306/imagine360tours'),
  DB_NAME: process.env.DB_NAME || 'imagine360tours',
  JWT_SECRET: process.env.JWT_SECRET || (isProd ? '' : 'imagine360_super_secret_jwt_key_2026_spatial_tech_pune'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  CORS_ORIGINS: process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '',
};

