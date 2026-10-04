import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// SUPER_ADMIN, ADMIN, SALES, STAFF can view customers
router.get('/', authorizeRoles('ADMIN', 'SALES', 'STAFF'), getCustomers);
router.get('/:id', authorizeRoles('ADMIN', 'SALES', 'STAFF'), getCustomerById);
router.post('/', authorizeRoles('ADMIN', 'SALES'), createCustomer);
router.put('/:id', authorizeRoles('ADMIN', 'SALES'), updateCustomer);
router.delete('/:id', authorizeRoles('ADMIN'), deleteCustomer);

export default router;
