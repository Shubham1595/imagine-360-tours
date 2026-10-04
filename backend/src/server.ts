import { app } from './app';
import { ENV } from './config/env';
import { prisma } from './config/db';

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✔ Connected to MySQL database:', ENV.DB_NAME);

    const server = app.listen(ENV.PORT, ENV.HOST, () => {
      console.log(`🚀 Imagine 360 Tours API server running on http://${ENV.HOST}:${ENV.PORT} (${ENV.NODE_ENV})`);
    });

    server.on('error', async (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `\n⚠️  [PORT CONFLICT] Port ${ENV.PORT} is already in use.\n` +
          `An existing backend process is already running on port ${ENV.PORT}.\n` +
          `To prevent duplicate instances, this process will exit cleanly.\n`
        );
        await prisma.$disconnect();
        process.exit(0);
      } else {
        console.error('Server error encountered:', err);
        await prisma.$disconnect();
        process.exit(1);
      }
    });

    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
