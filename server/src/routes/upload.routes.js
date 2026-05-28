import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { handleUpload } from '../controllers/upload.controller.js'

const router = Router()

/**
 * POST /api/upload
 *
 * Middleware chain:
 *  1. upload.single('resume') — multer parses multipart body, validates MIME type,
 *     enforces file-size limit, and attaches req.file (Buffer in memory).
 *  2. handleUpload — controller that extracts PDF text and responds.
 *
 * Field names expected from the React frontend:
 *   resume         {File}   — the PDF résumé
 *   jobDescription {string} — the job description text
 */
router.post('/upload', upload.single('resume'), handleUpload)

export default router
