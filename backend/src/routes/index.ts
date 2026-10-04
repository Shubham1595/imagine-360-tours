import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import leadRoutes from './lead.routes';
import callRoutes from './call.routes';
import followupRoutes from './followup.routes';
import enquiryRoutes from './enquiry.routes';
import bookingRoutes from './booking.routes';
import projectRoutes from './project.routes';
import serviceRoutes from './service.routes';
import importRoutes from './import.routes';
import adminRoutes from './admin.routes';
import quotationRoutes from './quotation.routes';
import publicRoutes from './public.routes';

const router = Router();

// Public website API endpoints (Read-only, projection filtered, unauthenticated)
router.use('/public', publicRoutes);

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/leads', leadRoutes);
router.use('/calls', callRoutes);
router.use('/follow-ups', followupRoutes);
router.use('/quotations', quotationRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/bookings', bookingRoutes);
router.use('/projects', projectRoutes);
router.use('/services', serviceRoutes);
router.use('/import', importRoutes);
router.use('/admin', adminRoutes);

// Production-safe health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
