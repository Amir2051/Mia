import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import chatRoutes from './routes/chat.js';
import { sessionMiddleware } from './middleware/sessionMiddleware.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use('/api/chat', rateLimit({
  windowMs: 60_000,
  max: 30,
  message: { error: 'Too many requests. Please slow down.' }
}));

app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(sessionMiddleware);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'Mia API', ts: new Date().toISOString() }));

app.use('/api/chat', chatRoutes);

app.use((_, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, _next) => {
  logger.error(`${req.method} ${req.path} — ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => logger.info(`Mia API running on port ${PORT}`));

export default app;
