import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { prisma } from './db.js';
import { errorHandler, notFound, route } from './http.js';
import authRoutes from './routes/auth.js';
import discoveryRoutes from './routes/discovery.js';
import applicationRoutes from './routes/applications.js';
import networkRoutes from './routes/network.js';
import workspaceRoutes from './routes/workspace.js';
import recruiterRoutes from './routes/recruiter.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    cors({
      origin: config.CLIENT_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '512kb' }));
  app.use(cookieParser());

  app.get(
    '/health',
    route(async (req, res) => {
      await prisma.$queryRaw`select 1`;
      res.json({ ok: true, service: 'devconnect-api', database: 'connected', time: new Date().toISOString() });
    }),
  );

  // Versioned surface: /api/v1/* — the REST contract the synopsis describes. The client's
  // VITE_API_BASE_URL is pointed here.
  app.use('/api/v1', authRoutes);
  app.use('/api/v1', discoveryRoutes);
  app.use('/api/v1', applicationRoutes);
  app.use('/api/v1', networkRoutes);
  app.use('/api/v1', workspaceRoutes);
  app.use('/api/v1', recruiterRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
