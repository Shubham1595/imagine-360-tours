import { Router } from 'express';
import { getAdminDashboardStats, getAdminReports } from '../controllers/dashboard.controller';
import { getUsers, createUser, updateUserRole, getAuditLogs } from '../controllers/user.controller';
import { getAllSettingsAdmin, updateSettingsAdmin } from '../controllers/settings.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Dashboard stats: ADMIN, SALES, STAFF
router.get('/dashboard', authorizeRoles('ADMIN', 'SALES', 'STAFF'), getAdminDashboardStats);

// Reports: ADMIN, SALES
router.get('/reports', authorizeRoles('ADMIN', 'SALES'), getAdminReports);

// User management: ADMIN only
router.get('/users', authorizeRoles('ADMIN'), getUsers);
router.post('/users', authorizeRoles('ADMIN'), createUser);
router.put('/users/:id/role', authorizeRoles('ADMIN'), updateUserRole);

// Audit logs: ADMIN only
router.get('/audit-logs', authorizeRoles('ADMIN'), getAuditLogs);

// Website Settings CMS: ADMIN only (SUPER_ADMIN and ADMIN)
router.get('/settings', authorizeRoles('ADMIN'), getAllSettingsAdmin);
router.put('/settings', authorizeRoles('ADMIN'), updateSettingsAdmin);

export default router;
