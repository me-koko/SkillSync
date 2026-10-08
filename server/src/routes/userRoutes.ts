import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../services/storageService';

const router = Router();

router.get('/skills', UserController.getAllSkills);
router.get('/interests', UserController.getAllInterests);
router.get('/:id', authenticateToken, UserController.getProfile);
router.put('/me', authenticateToken, UserController.updateProfile);
router.post('/onboarding', authenticateToken, UserController.completeOnboarding);
router.post('/onboard', authenticateToken, UserController.completeOnboarding);
router.post('/avatar', authenticateToken, upload.single('avatar'), UserController.uploadAvatar);

export default router;
