import { Router } from 'express';
import {
  getServices,
  getAllServicesAdmin,
  getServiceById,
  createService,
  updateService,
  toggleAvailability,
  toggleVisibility,
  toggleFeatured,
  reorderServices,
  deleteService,
} from '../controllers/service.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

// Public services catalog (safe, projection-filtered, is_visible = true)
router.get('/', getServices);

// Admin Service CMS Management (SUPER_ADMIN and ADMIN only)
router.get('/all', authenticate, authorizeRoles('ADMIN'), getAllServicesAdmin);
router.get('/:id', getServiceById);
router.post('/', authenticate, authorizeRoles('ADMIN'), createService);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), updateService);
router.patch('/:id/availability', authenticate, authorizeRoles('ADMIN'), toggleAvailability);
router.patch('/:id/visibility', authenticate, authorizeRoles('ADMIN'), toggleVisibility);
router.patch('/:id/featured', authenticate, authorizeRoles('ADMIN'), toggleFeatured);
router.patch('/reorder', authenticate, authorizeRoles('ADMIN'), reorderServices);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteService);

export default router;
