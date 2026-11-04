import { createApp } from './app.js';
import { config } from './config.js';
import { prisma } from './db.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log(`DevConnect API on http://localhost:${config.PORT}/api/v1 (env: ${config.NODE_ENV})`);
});

async function shutdown(signal) {
  console.log(`\n${signal} received, closing the server.`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
