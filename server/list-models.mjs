/**
 * Drop into server/ and run:  node list-models.mjs
 * Lists every model your API key can actually access.
 */
import 'dotenv/config'

const KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY

if (!KEY) {
  console.error('❌  No API key found in server/.env')
  process.exit(1)
}

console.log('\n=== Models available to your API key ===\n')

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`
)
const data = await res.json()

if (!res.ok) {
  console.error('❌  API error:', data.error?.message || JSON.stringify(data))
  console.error('\nThis usually means:')
  console.error('  1. Your key is invalid or expired')
  console.error('  2. The Generative Language API is not enabled for this project')
  console.error('  3. Your key type does not support this API')
  process.exit(1)
}

const models = data.models || []
console.log(`Found ${models.length} models:\n`)

// Show embedding models first
const embeddingModels = models.filter(m =>
  m.supportedGenerationMethods?.includes('embedContent') ||
  m.supportedGenerationMethods?.includes('batchEmbedContents')
)
const chatModels = models.filter(m =>
  m.supportedGenerationMethods?.includes('generateContent')
)

if (embeddingModels.length) {
  console.log('── EMBEDDING MODELS (use one of these) ─────────────────')
  embeddingModels.forEach(m => {
    console.log(`  ✅  ${m.name}  →  use: "${m.name.replace('models/', '')}"`)
  })
} else {
  console.log('── EMBEDDING MODELS ─────────────────────────────────────')
  console.log('  ❌  None found — your key cannot do embeddings!')
}

console.log('\n── CHAT MODELS ──────────────────────────────────────────')
chatModels.slice(0, 10).forEach(m => {
  console.log(`  💬  ${m.name}`)
})

console.log('\n─────────────────────────────────────────────────────────')
console.log('Copy the embedding model name above into server/.env:')
console.log('  GEMINI_EMBEDDING_MODEL=<name from above>')
console.log('')
