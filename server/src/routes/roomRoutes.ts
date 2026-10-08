import { Router } from 'express';
import { RoomController } from '../controllers/roomController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, RoomController.getRooms);
router.post('/', authenticateToken, RoomController.createRoom);
router.get('/:id', authenticateToken, RoomController.getRoomById);
router.post('/:id/join', authenticateToken, RoomController.joinRoom);
router.put('/:id/notes', authenticateToken, RoomController.updateNotes);
router.put('/:id/timer', authenticateToken, RoomController.updateTimer);

export default router;
