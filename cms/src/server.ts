import express from 'express';
import payload from 'payload';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Redirect root to Payload Admin dashboard
app.get('/', (_, res) => {
  res.redirect('/admin');
});

const start = async () => {
  try {
    // Initialize Payload CMS
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'development_secret_32_characters_minimum_sample',
      express: app,
      onInit: async () => {
        payload.logger.info(`Payload Admin URL: http://localhost:${PORT}/admin`);
        payload.logger.info(`Payload API URL:   http://localhost:${PORT}/api`);
      },
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚡ Payload CMS running on port ${PORT}`);
      console.log(`👉 PostgreSQL connected: ${Boolean(process.env.DATABASE_URI)}`);
      console.log(`👉 Admin Panel: http://localhost:${PORT}/admin`);
      console.log(`👉 REST API:    http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to initialize Payload CMS:', error);
    process.exit(1);
  }
};

start();
