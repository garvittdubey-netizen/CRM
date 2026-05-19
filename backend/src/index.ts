import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { prisma } from './lib/prisma';
import { seedAdmin } from './scripts/seed';

const app = express();
const PORT = parseInt(process.env.PORT || '8002', 10);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman) or allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, allow all origins
        callback(null, true);
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'real-estate-crm', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    await seedAdmin();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Node.js backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
