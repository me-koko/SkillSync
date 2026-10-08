import { Router } from 'express';
import { DiscoverController } from '../controllers/discoverController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, DiscoverController.discoverStudents);
router.get('/matches', authenticateToken, DiscoverController.getTopMatches);

export default router;
