import { Router } from 'express';
import {
  createProject,
  getProjects,
  updateProject,
  toggleProjectPublicVisibility,
} from '../controllers/project.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', authorizeRoles('ADMIN', 'SALES', 'STAFF'), createProject);
router.put('/:id', authorizeRoles('ADMIN', 'SALES', 'STAFF'), updateProject);

// CMS Project Public Visibility: ADMIN (and SUPER_ADMIN) only
router.patch('/:id/public-visibility', authorizeRoles('ADMIN'), toggleProjectPublicVisibility);

export default router;
