/**
 * src/config/llm.js
 */

import { OpenAIEmbeddings }        from '@langchain/openai'
import { ChatOpenAI }              from '@langchain/openai'
import { ChatGoogleGenerativeAI }  from '@langchain/google-genai'
import { GeminiEmbeddingsWithDims } from './geminiEmbeddings.js'

export const EMBEDDING_DIMENSIONS = {
  openai: 1536,
  gemini: 768,
}

export function createEmbeddings() {
  const provider = (process.env.EMBEDDING_PROVIDER || 'openai').toLowerCase()

  switch (provider) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY)
        throw new Error('OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai')
      return new OpenAIEmbeddings({
        openAIApiKey:  process.env.OPENAI_API_KEY,
        modelName:     'text-embedding-3-small',
        batchSize:     512,
        stripNewLines: true,
      })

    case 'gemini':
      if (!process.env.GOOGLE_API_KEY)
        throw new Error('GOOGLE_API_KEY is required when EMBEDDING_PROVIDER=gemini')
      // Use custom class — @langchain/google-genai v0.1.x silently ignores
      // outputDimensionality, causing 3072-dim vectors that exceed Supabase's limit.
      return new GeminiEmbeddingsWithDims({
        apiKey:               process.env.GOOGLE_API_KEY,
        model:                'gemini-embedding-001',
        outputDimensionality: 768,
      })

    default:
      throw new Error(`Unknown EMBEDDING_PROVIDER "${provider}". Valid: openai, gemini`)
  }
}

export function createLLM() {
  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase()

  switch (provider) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY)
        throw new Error('OPENAI_API_KEY is required when LLM_PROVIDER=openai')
      return new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName:    'gpt-4o',
        temperature:  0.4,
        maxTokens:    512,
      })

    case 'gemini':
      if (!process.env.GOOGLE_API_KEY)
        throw new Error('GOOGLE_API_KEY is required when LLM_PROVIDER=gemini')
      return new ChatGoogleGenerativeAI({
        apiKey:          process.env.GOOGLE_API_KEY,
        model:           'gemini-2.5-flash',
        temperature:     0.4,
        maxOutputTokens: 512,
      })

    default:
      throw new Error(`Unknown LLM_PROVIDER "${provider}". Valid: openai, gemini`)
  }
}
