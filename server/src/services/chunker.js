/**
 * src/services/chunker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts raw resume + JD strings into LangChain Document objects ready for
 * embedding.  Each Document carries metadata that the retriever and prompt
 * builder use to distinguish and cite sources.
 *
 * Strategy:
 *  • RecursiveCharacterTextSplitter — preserves paragraph/sentence boundaries
 *    better than a fixed-width split.
 *  • Separate splitter instances per source so you can tune sizes independently
 *    in future (JDs are usually shorter and more structured than resumes).
 *  • chunk_index is attached so you can reconstruct document order if needed.
 */

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document }                        from '@langchain/core/documents'

const CHUNK_SIZE    = parseInt(process.env.CHUNK_SIZE    || '800',  10)
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || '120',  10)

/**
 * Build a splitter tuned for a given source type.
 * Resume text is dense (bullets, dates, roles) — tighter overlap keeps context.
 * JD text can have larger natural breaks between sections.
 */
function makeSplitter(source) {
  const overlapMultiplier = source === 'resume' ? 1 : 0.8
  return new RecursiveCharacterTextSplitter({
    chunkSize:    CHUNK_SIZE,
    chunkOverlap: Math.round(CHUNK_OVERLAP * overlapMultiplier),
    // Separator hierarchy: try paragraph → sentence → word → char
    separators: ['\n\n', '\n', '. ', ' ', ''],
  })
}

/**
 * chunkText
 * ─────────────────────────────────────────────────────────────────────────────
 * @param {string} text       - raw extracted text
 * @param {'resume'|'job_description'} source
 * @param {string} sessionId  - UUID of the interview_sessions row
 * @returns {Promise<Document[]>}
 */
export async function chunkText(text, source, sessionId) {
  if (!text?.trim()) return []

  const splitter = makeSplitter(source)
  const rawChunks = await splitter.splitText(text)

  return rawChunks
    .filter((chunk) => chunk.trim().length > 20)   // discard near-empty chunks
    .map((chunk, index) =>
      new Document({
        pageContent: chunk.trim(),
        metadata: {
          source,
          session_id:  sessionId,    // used by match_documents RPC filter
          chunk_index: index,
        },
      })
    )
}

/**
 * chunkAll
 * ─────────────────────────────────────────────────────────────────────────────
 * Convenience wrapper — chunks both resume and JD in parallel.
 *
 * @returns {Promise<{ resumeDocs: Document[], jdDocs: Document[], total: number }>}
 */
export async function chunkAll({ resumeText, jobDescription, sessionId }) {
  const [resumeDocs, jdDocs] = await Promise.all([
    chunkText(resumeText,    'resume',           sessionId),
    chunkText(jobDescription, 'job_description', sessionId),
  ])

  return {
    resumeDocs,
    jdDocs,
    total: resumeDocs.length + jdDocs.length,
  }
}
