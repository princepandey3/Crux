import multer from 'multer'

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)

/**
 * Use in-memory storage so the file buffer is immediately available
 * to pdf-parse without touching the filesystem.
 */
const storage = multer.memoryStorage()

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(
      Object.assign(new Error('Only PDF files are accepted for the résumé.'), {
        status: 400,
      }),
      false
    )
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter,
})
