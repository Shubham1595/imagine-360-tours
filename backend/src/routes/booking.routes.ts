import { Router } from 'express';
import {
  createBooking,
  getBookings,
  updateBookingStatus,
} from '../controllers/booking.controller';
import { authenticate, authorizeRoles, optionalAuth } from '../middleware/auth';

const router = Router();

// Public / Website booking
router.post('/', optionalAuth, createBooking);

// Protected: User can view their own, Admin/Sales can view all
router.get('/', authenticate, getBookings);
router.put('/:id/status', authenticate, authorizeRoles('ADMIN', 'SALES'), updateBookingStatus);

export default router;
