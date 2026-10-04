import { Router } from 'express';
import multer from 'multer';
import {
  parseUploadFile,
  validateImportRows,
  executeImport,
  getImportBatches,
  getImportBatchErrors,
} from '../controllers/import.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.match(/\.(csv|xlsx|xls)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Please upload a .csv, .xlsx or .xls file.'));
    }
  },
});

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'SALES'));

// 1. Upload & Parse File
router.post('/upload', upload.single('file'), parseUploadFile);

// 2. Validate Rows & Check Duplicates
router.post('/validate', validateImportRows);

// 3. Confirm & Execute Import
router.post('/confirm', executeImport);

// 4. Batch History & Errors
router.get('/batches', getImportBatches);
router.get('/batches/:id/errors', getImportBatchErrors);

export default router;
