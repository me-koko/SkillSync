import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { config } from './config/environment';
import { initializeSocket } from './socket/socketManager';
import { errorHandler } from './middleware/error';

// Import route modules
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import discoverRoutes from './routes/discoverRoutes';
import connectionRoutes from './routes/connectionRoutes';
import exchangeRoutes from './routes/exchangeRoutes';
import groupRoutes from './routes/groupRoutes';
import roomRoutes from './routes/roomRoutes';
import taskRoutes from './routes/taskRoutes';
import messageRoutes from './routes/messageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import resourceRoutes from './routes/resourceRoutes';
import reviewRoutes from './routes/reviewRoutes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local upload files statically
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'SkillSync',
    tagline: 'Learn together. Teach what you know.',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/study-rooms', roomRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reviews', reviewRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server
server.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(` SkillSync Backend Server running on port ${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` Health Check: http://localhost:${config.port}/api/health`);
  console.log(` Database: Connected via Prisma`);
  console.log(` Real-Time: Socket.IO initialized`);
  console.log(`=========================================`);
});
