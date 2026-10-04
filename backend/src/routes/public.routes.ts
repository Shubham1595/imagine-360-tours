import { Router } from 'express';
import {
  getPublicServices,
  getPublicProjects,
  getPublicSettings,
} from '../controllers/public.controller';

const router = Router();

// Public Read-Only CMS Endpoints (No authentication required)
// Disable aggressive caching to ensure live CMS master control propagation
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

router.get('/services', getPublicServices);
router.get('/projects', getPublicProjects);
router.get('/settings', getPublicSettings);

export default router;
