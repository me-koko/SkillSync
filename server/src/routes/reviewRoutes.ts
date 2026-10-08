import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, ReviewController.createReview);
router.get('/user/:userId', authenticateToken, ReviewController.getReviewsForUser);

export default router;
