require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    // Initialize database (verifies tables in Neon or local fallback)
    await initDatabase();

    const server = app.listen(PORT, HOST, () => {
      console.log('====================================================');
      console.log(`🚀 Saravanan Builders Backend API running on http://${HOST}:${PORT}`);
      console.log(`📡 Port: ${PORT} | Host: ${HOST}`);
      console.log(`📊 Health Check: http://${HOST}:${PORT}/api/health`);
      console.log('====================================================');
    });

    // Graceful shutdown handling for cloud environments (Render, Docker, Kubernetes)
    const gracefulShutdown = (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('Forced shutdown due to lingering connections.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection at]:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]:', error);
});

startServer();
