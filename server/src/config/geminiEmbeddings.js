/**
 * src/config/geminiEmbeddings.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom LangChain-compatible embeddings class that calls the Gemini API
 * directly with outputDimensionality support.
 *
 * Why: @langchain/google-genai v0.1.x does NOT support outputDimensionality,
 * so passing it is silently ignored and the model returns full 3072-dim vectors
 * which exceed Supabase pgvector's 2000-dim limit for indexes.
 *
 * This class is a drop-in replacement — it implements the same
 * embedDocuments() / embedQuery() interface LangChain expects.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { Embeddings }          from '@langchain/core/embeddings'

export class GeminiEmbeddingsWithDims extends Embeddings {
  constructor({ apiKey, model = 'gemini-embedding-001', outputDimensionality = 768 }) {
    super({})
    this.model               = model
    this.outputDimensionality = outputDimensionality
    this.client              = new GoogleGenerativeAI(apiKey)
      .getGenerativeModel({ model })
  }

  /**
   * Embed a single string — used by the pre-flight check and similarity search.
   */
  async embedQuery(text) {
    const res = await this.client.embedContent({
      content:  { role: 'user', parts: [{ text }] },
      outputDimensionality: this.outputDimensionality,
    })
    return res.embedding.values
  }

  /**
   * Embed an array of strings — used by SupabaseVectorStore.fromDocuments().
   * Batches in groups of 100 to stay within API limits.
   */
  async embedDocuments(texts) {
    const BATCH = 100
    const results = []

    for (let i = 0; i < texts.length; i += BATCH) {
      const batch = texts.slice(i, i + BATCH)
      const promises = batch.map((text) =>
        this.client.embedContent({
          content:  { role: 'user', parts: [{ text }] },
          outputDimensionality: this.outputDimensionality,
        })
      )
      const responses = await Promise.all(promises)
      results.push(...responses.map((r) => r.embedding.values))
    }

    return results
  }
}
