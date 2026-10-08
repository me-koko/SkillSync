import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../services/storageService';

const router = Router();

router.get('/', authenticateToken, ResourceController.getResources);
router.post('/link', authenticateToken, ResourceController.createLinkResource);
router.post('/upload', authenticateToken, upload.single('file'), ResourceController.uploadFileResource);
router.delete('/:id', authenticateToken, ResourceController.deleteResource);

export default router;
