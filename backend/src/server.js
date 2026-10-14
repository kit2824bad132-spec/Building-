require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database (verifies tables in Neon or local fallback)
    await initDatabase();

    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Saravanan Builders Backend API running on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
