import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, NotificationController.getNotifications);
router.put('/:id/read', authenticateToken, NotificationController.markAsRead);
router.put('/read-all', authenticateToken, NotificationController.markAllAsRead);

export default router;
