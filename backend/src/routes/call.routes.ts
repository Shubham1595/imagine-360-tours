import { Router } from 'express';
import { logCall, getCustomerCalls, getAllCalls } from '../controllers/call.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('ADMIN', 'SALES', 'STAFF'), logCall);
router.get('/customer/:id', authorizeRoles('ADMIN', 'SALES', 'STAFF'), getCustomerCalls);
router.get('/', authorizeRoles('ADMIN', 'SALES'), getAllCalls);

export default router;
