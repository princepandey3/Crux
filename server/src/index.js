import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`\n🚀  DeepDive API server running on http://localhost:${PORT}`)
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Supabase URL: ${process.env.SUPABASE_URL ? '✓ set' : '✗ MISSING'}\n`)
})
