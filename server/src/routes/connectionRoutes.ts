import { Router } from 'express';
import { ConnectionController } from '../controllers/connectionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, ConnectionController.getConnections);
router.post('/', authenticateToken, ConnectionController.sendRequest);
router.put('/:id', authenticateToken, ConnectionController.respondRequest);
router.delete('/:id', authenticateToken, ConnectionController.removeConnection);

export default router;
