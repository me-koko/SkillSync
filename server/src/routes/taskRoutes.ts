import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, TaskController.getTasks);
router.post('/', authenticateToken, TaskController.createTask);
router.put('/:id', authenticateToken, TaskController.updateTask);
router.delete('/:id', authenticateToken, TaskController.deleteTask);

export default router;
