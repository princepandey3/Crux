/**
 * src/services/ragPipeline.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates the full Phase 4 flow:
 *
 *   ingestDocuments()
 *     1. Create an interview_sessions row in Supabase.
 *     2. Chunk resume + JD text.
 *     3. Embed chunks and insert into the documents table via SupabaseVectorStore.
 *
 *   generateOpeningQuestion()
 *     4. Retrieve the most relevant chunks for an interview-focused query.
 *     5. Build a structured prompt that strictly grounds the LLM in those chunks.
 *     6. Call the chat LLM and return the generated opening question + sources.
 */

import supabase                       from '../config/supabase.js'
import { chunkAll }                   from './chunker.js'
import { insertDocuments, similaritySearch } from './vectorStore.js'
import { createLLM }                  from '../config/llm.js'
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

// ── Lazy LLM singleton ────────────────────────────────────────────────────────
let _llm = null
function getLLM() {
  if (!_llm) _llm = createLLM()
  return _llm
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 1 — Create session row
// ─────────────────────────────────────────────────────────────────────────────
async function createSession({ fileName, fileSizeKb, pageCount }) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({ file_name: fileName, file_size_kb: fileSizeKb, page_count: pageCount })
    .select('id')
    .single()

  if (error) throw Object.assign(new Error(`Failed to create session: ${error.message}`), { status: 500 })
  return data.id
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEPS 2–3 — Chunk + embed + insert
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ingestDocuments
 * ─────────────────────────────────────────────────────────────────────────────
 * @param {{
 *   resumeText:     string,
 *   jobDescription: string,
 *   meta: { fileName: string, fileSizeKb: number, pageCount: number }
 * }} payload
 * @returns {Promise<{ sessionId: string, chunkCount: number }>}
 */
export async function ingestDocuments({ resumeText, jobDescription, meta }) {
  // 1. Persist session
  const sessionId = await createSession(meta)

  // 2. Chunk both documents (parallel)
  const { resumeDocs, jdDocs, total } = await chunkAll({
    resumeText,
    jobDescription,
    sessionId,
  })

  if (total === 0) {
    throw Object.assign(
      new Error('Text chunking produced zero documents — check input quality.'),
      { status: 422 }
    )
  }

  // 3. Embed & insert (resume first so earlier rows get lower IDs)
  await insertDocuments([...resumeDocs, ...jdDocs])

  return { sessionId, chunkCount: total }
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 4–6 — RAG-powered interview question generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The retrieval query is deliberately broad so it surfaces chunks that span
 * both the candidate's background and the role requirements.  More targeted
 * queries can be used in later turns once we know the interview direction.
 */
const RETRIEVAL_QUERY =
  'candidate professional experience skills responsibilities achievements ' +
  'job requirements qualifications responsibilities technologies'

const SYSTEM_TEMPLATE = `You are an expert technical interviewer conducting a deep-dive behavioural \
and technical interview. Your task is to craft a single, high-quality opening interview question.

STRICT RULES you must follow:
1. Base the question EXCLUSIVELY on the context passages provided below.
2. The question MUST bridge something concrete from the candidate's résumé with a \
specific requirement or challenge described in the job description.
3. Ask about a real, verifiable detail (a project, a technology, a role, a metric) \
that appears in the résumé context — never invent details.
4. The question should invite a structured STAR-format answer (Situation, Task, Action, Result).
5. Ask only ONE question. Do not add preamble, explanation, or follow-up questions.
6. If the context is insufficient to ask a grounded question, respond only with: \
"INSUFFICIENT_CONTEXT"

─── CONTEXT PASSAGES ───────────────────────────────────────────────────────────
{context}
────────────────────────────────────────────────────────────────────────────────`

const HUMAN_TEMPLATE =
  `Generate the opening interview question now. Output only the question text, \
nothing else.`

const interviewPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
  HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
])

/**
 * Formats retrieved Document[] into a labelled, readable context block.
 */
function formatContext(docs) {
  return docs
    .map((doc, i) => {
      const label = doc.metadata.source === 'resume' ? '📄 RÉSUMÉ' : '📋 JOB DESCRIPTION'
      return `[${i + 1}] ${label}\n${doc.pageContent}`
    })
    .join('\n\n')
}

/**
 * generateOpeningQuestion
 * ─────────────────────────────────────────────────────────────────────────────
 * @param {string} sessionId
 * @returns {Promise<{
 *   question:    string,
 *   sources:     Array<{ source: string, excerpt: string }>,
 *   chunkCount:  number,
 * }>}
 */
export async function generateOpeningQuestion(sessionId) {
  // 4. Retrieve most relevant chunks for this session
  const docs = await similaritySearch(RETRIEVAL_QUERY, sessionId)

  if (!docs.length) {
    throw Object.assign(
      new Error('No document chunks found for this session. Was ingestion completed?'),
      { status: 404 }
    )
  }

  const context = formatContext(docs)

  // 5. Build prompt + 6. Call LLM
  const chain = interviewPrompt
    .pipe(getLLM())
    .pipe(new StringOutputParser())

  const raw = await chain.invoke({ context })
  const question = raw.trim()

  if (question === 'INSUFFICIENT_CONTEXT') {
    throw Object.assign(
      new Error(
        'The retrieved context did not contain enough grounded detail to generate ' +
        'a specific question. Try uploading a more detailed résumé or JD.'
      ),
      { status: 422 }
    )
  }

  // Surface the source excerpts so the frontend can show grounding info
  const sources = docs.map((doc) => ({
    source:  doc.metadata.source,
    excerpt: doc.pageContent.slice(0, 180).replace(/\s+/g, ' '),
  }))

  return { question, sources, chunkCount: docs.length }
}
