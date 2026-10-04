import { Router } from 'express';
import {
  getFollowUps,
  createFollowUp,
  completeFollowUp,
  updateFollowUp,
} from '../controllers/followup.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles('ADMIN', 'SALES', 'STAFF'), getFollowUps);
router.post('/', authorizeRoles('ADMIN', 'SALES', 'STAFF'), createFollowUp);
router.post('/:id/complete', authorizeRoles('ADMIN', 'SALES', 'STAFF'), completeFollowUp);
router.put('/:id', authorizeRoles('ADMIN', 'SALES', 'STAFF'), updateFollowUp);

export default router;
