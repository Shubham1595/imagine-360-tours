import { Router } from 'express';
import {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  updateQuotationStatus,
  deleteQuotation,
} from '../controllers/quotation.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

// All quotation routes require authentication
router.use(authenticate);

// List quotations (ADMIN, SALES, STAFF)
router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SALES', 'STAFF'), getQuotations);

// Get quotation by ID
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SALES', 'STAFF'), getQuotationById);

// Create quotation (ADMIN, SALES)
router.post('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SALES'), createQuotation);

// Update quotation (ADMIN, SALES)
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SALES'), updateQuotation);

// Update status (ADMIN, SALES)
router.patch('/:id/status', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SALES'), updateQuotationStatus);

// Delete quotation (SUPER_ADMIN, ADMIN, SALES)
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SALES'), deleteQuotation);

export default router;
