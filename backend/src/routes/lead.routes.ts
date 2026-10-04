import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  getLeadsKanban,
  updateLeadStatus,
  updateLeadStage,
  scheduleProjectDiscussion,
  createProjectForLead,
} from '../controllers/lead.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles('ADMIN', 'SALES', 'STAFF'), getLeads);
router.get('/kanban', authorizeRoles('ADMIN', 'SALES', 'STAFF'), getLeadsKanban);
router.get('/:id', authorizeRoles('ADMIN', 'SALES', 'STAFF'), getLeadById);
router.put('/:id/status', authorizeRoles('ADMIN', 'SALES', 'STAFF'), updateLeadStatus);
router.put('/:id/stage', authorizeRoles('ADMIN', 'SALES', 'STAFF'), updateLeadStage);
router.post('/:id/project-follow-up', authorizeRoles('ADMIN', 'SALES', 'STAFF'), scheduleProjectDiscussion);
router.post('/:id/create-project', authorizeRoles('ADMIN', 'SALES', 'STAFF'), createProjectForLead);

export default router;
