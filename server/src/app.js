import express from 'express'
import cors from 'cors'
import uploadRoutes from './routes/upload.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// ── CORS ────────────────────────────────────────────────────────────────────
// Allow requests from the Vite dev server; tighten in production.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server calls (no Origin header) and listed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS: origin '${origin}' not allowed`))
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ── Body parsers ─────────────────────────────────────────────────────────────
// multer handles multipart/form-data; express.json covers any future JSON routes
app.use(express.json({ limit: '1mb' }))

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api', uploadRoutes)

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler)

export default app
