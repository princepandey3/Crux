import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 3001

const EMBEDDING_PROVIDER = (process.env.EMBEDDING_PROVIDER || 'openai').toLowerCase()
const LLM_PROVIDER       = (process.env.LLM_PROVIDER       || 'openai').toLowerCase()

const missing = []

if (!process.env.SUPABASE_URL)             missing.push('SUPABASE_URL')
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')

if (EMBEDDING_PROVIDER === 'openai' || LLM_PROVIDER === 'openai') {
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY')
}
if (EMBEDDING_PROVIDER === 'gemini' || LLM_PROVIDER === 'gemini') {
  // FIX Bug 2: .env.example has GEMINI_API_KEY but code reads GOOGLE_API_KEY
  // Normalise: accept either name, prefer GOOGLE_API_KEY
  if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
    missing.push('GOOGLE_API_KEY (or GEMINI_API_KEY)')
  }
  // Alias GEMINI_API_KEY → GOOGLE_API_KEY so the rest of the code works
  if (!process.env.GOOGLE_API_KEY && process.env.GEMINI_API_KEY) {
    process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY
  }
}

if (missing.length) {
  console.error('\n❌  Missing required environment variables:')
  missing.forEach((k) => console.error(`     • ${k}`))
  console.error('\n   Add them to server/.env and restart.\n')
  process.exit(1)
}

app.listen(PORT, () => {
  console.log(`\n🚀  DeepDive API server running on http://localhost:${PORT}`)
  console.log(`   Environment      : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Supabase URL     : ✓ set`)
  console.log(`   Embedding model  : ${EMBEDDING_PROVIDER}`)
  console.log(`   LLM provider     : ${LLM_PROVIDER}\n`)
})
