import { Router } from 'express';
import { MessageController } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticateToken, MessageController.getConversations);
router.get('/direct/:peerId', authenticateToken, MessageController.getDirectMessages);
router.post('/', authenticateToken, MessageController.sendMessage);

export default router;
