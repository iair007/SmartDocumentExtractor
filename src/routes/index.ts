import dotenv from 'dotenv';
import { Router } from 'express';
import multer from 'multer';
import { handleFileUpload } from '../uploads/uploadController';

const router = Router();
const upload = multer({ dest: 'src/uploads/' });
dotenv.config();

router.post('/upload', upload.single('document'), handleFileUpload);

export default router;
