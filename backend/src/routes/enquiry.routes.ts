import { Router } from 'express';
import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
} from '../controllers/enquiry.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { publicEnquiryRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public: Website Contact Form Submission (Rate limited against bot abuse)
router.post('/', publicEnquiryRateLimiter, createEnquiry);

// Protected: Admin/CRM review
router.get('/', authenticate, authorizeRoles('ADMIN', 'SALES'), getEnquiries);
router.put('/:id/status', authenticate, authorizeRoles('ADMIN', 'SALES'), updateEnquiryStatus);

export default router;
