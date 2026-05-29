/**
 * Paste this into your server/ folder and run:
 *   node test-embed.mjs
 *
 * It bypasses LangChain entirely and calls the Gemini API directly
 * so you can see the exact error message.
 */
import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'

const KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY

console.log('\n=== Gemini Embedding Direct Test ===')
console.log('GOOGLE_API_KEY :', KEY ? `✓ set (${KEY.slice(0, 8)}...)` : '✗ MISSING')
console.log('EMBEDDING_PROVIDER:', process.env.EMBEDDING_PROVIDER || '(not set, defaults to openai)')
console.log('')

if (!KEY) {
  console.error('❌  No API key found. Set GOOGLE_API_KEY in server/.env')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(KEY)

// Test 1: with models/ prefix
console.log('Test 1 — model: "models/text-embedding-004"')
try {
  const model = genAI.getGenerativeModel({ model: 'models/text-embedding-004' })
  const result = await model.embedContent('Hello world')
  const vec = result.embedding.values
  console.log(`  ✅ Success! Vector length: ${vec.length}, first value: ${vec[0].toFixed(6)}\n`)
} catch (e) {
  console.error(`  ❌ Failed: ${e.message}\n`)
}

// Test 2: without models/ prefix
console.log('Test 2 — model: "text-embedding-004"')
try {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
  const result = await model.embedContent('Hello world')
  const vec = result.embedding.values
  console.log(`  ✅ Success! Vector length: ${vec.length}, first value: ${vec[0].toFixed(6)}\n`)
} catch (e) {
  console.error(`  ❌ Failed: ${e.message}\n`)
}

// Test 3: via LangChain (to confirm the wrapper)
console.log('Test 3 — LangChain GoogleGenerativeAIEmbeddings')
try {
  const { GoogleGenerativeAIEmbeddings } = await import('@langchain/google-genai')
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: KEY,
    model: 'text-embedding-004',
  })
  const result = await embeddings.embedDocuments(['Hello world'])
  const vec = result[0]
  if (!vec || vec.length === 0) {
    console.error('  ❌ LangChain returned empty vector (API call failed silently)')
    console.error('  → This means batchEmbedContents failed. Check API key permissions.')
  } else {
    console.log(`  ✅ LangChain success! Vector length: ${vec.length}\n`)
  }
} catch (e) {
  console.error(`  ❌ LangChain threw: ${e.message}\n`)
}
