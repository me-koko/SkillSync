import { Router } from 'express';
import { GroupController } from '../controllers/groupController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, GroupController.getGroups);
router.post('/', authenticateToken, GroupController.createGroup);
router.get('/:id', authenticateToken, GroupController.getGroupById);
router.post('/:id/join', authenticateToken, GroupController.joinGroup);
router.post('/:id/leave', authenticateToken, GroupController.leaveGroup);
router.put('/:id/roles', authenticateToken, GroupController.updateMemberRole);
router.delete('/:id/members/:memberId', authenticateToken, GroupController.removeMember);

export default router;
