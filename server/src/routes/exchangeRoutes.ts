import { Router } from 'express';
import { ExchangeController } from '../controllers/exchangeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, ExchangeController.getExchanges);
router.get('/:id', authenticateToken, ExchangeController.getExchangeById);
router.post('/', authenticateToken, ExchangeController.createExchange);
router.put('/:id', authenticateToken, ExchangeController.updateExchangeStatus);

export default router;
