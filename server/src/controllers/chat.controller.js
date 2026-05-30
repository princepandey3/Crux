/**
 * src/controllers/chat.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/chat
 *
 * Request body (JSON):
 *   sessionId   string   — the interview_session id from Phase 4 upload
 *   message     string   — the candidate's latest reply
 *
 * Flow:
 *   1. Validate request body
 *   2. Find (or create) the chat_session row linked to this interview session
 *   3. Load full message history from chat_messages for LLM context
 *   4. Query the Supabase vector store for relevant document chunks (RAG)
 *   5. Call the chat LLM with: system prompt + RAG context + history + new message
 *   6. Insert BOTH the candidate's message and the AI reply into chat_messages
 *   7. Return the AI reply + rag sources to the frontend
 */

import {
  createChatSession,
  getChatSessionByInterviewId,
  getMessages,
  appendMessages,
} from '../services/chatHistory.js'
import { similaritySearch } from '../services/vectorStore.js'
import { createLLM } from '../config/llm.js'
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'

// ── Lazy LLM singleton ────────────────────────────────────────────────────────
let _llm = null
function getLLM() {
  if (!_llm) _llm = createLLM()
  return _llm
}

// ── System prompt for follow-up turns ────────────────────────────────────────
const FOLLOW_UP_SYSTEM = `You are an expert technical interviewer conducting a structured, \
grounded behavioural and technical interview. You are mid-conversation with a candidate.

STRICT RULES:
1. Your questions and comments must be grounded EXCLUSIVELY in the context passages below \
   (extracted from the candidate's résumé and the job description) AND in what the candidate \
   has already said in the conversation history.
2. Ask ONE follow-up question at a time. Do not stack multiple questions.
3. Probe for specifics: metrics, timelines, technologies, team size, personal contribution.
4. Encourage STAR-format responses (Situation, Task, Action, Result) when appropriate.
5. Never invent skills, projects, or details not found in the context or the candidate's replies.
6. Keep each response concise (2–4 sentences max before the question).

─── CONTEXT PASSAGES ────────────────────────────────────────────────────────────
{context}
─────────────────────────────────────────────────────────────────────────────────`

// ── Format RAG docs into a readable context block ─────────────────────────────
function formatContext(docs) {
  if (!docs.length) return '(No relevant context found — proceed based on conversation history.)'
  return docs
    .map((doc, i) => {
      const label = doc.metadata.source === 'resume' ? '📄 RÉSUMÉ' : '📋 JOB DESCRIPTION'
      return `[${i + 1}] ${label}\n${doc.pageContent}`
    })
    .join('\n\n')
}

// ── Build LangChain message history from DB rows ──────────────────────────────
function buildMessageHistory(rows) {
  return rows.map((row) =>
    row.role === 'user'
      ? new HumanMessage(row.content)
      : new AIMessage(row.content)
  )
}

// ── Controller ────────────────────────────────────────────────────────────────
export async function handleChat(req, res, next) {
  try {
    // ── 1. Validate ─────────────────────────────────────────────────────────
    const { sessionId, message } = req.body ?? {}

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        success: false,
        error: '`sessionId` is required (the interview session UUID).',
      })
    }

    const userText = (message ?? '').trim()
    if (!userText) {
      return res.status(400).json({
        success: false,
        error: '`message` must be a non-empty string.',
      })
    }

    // ── 2. Resolve chat session ──────────────────────────────────────────────
    // Look for an existing chat_session for this interview session.
    // If none exists (e.g. this is the very first message), create one.
    let chatSession = await getChatSessionByInterviewId(sessionId)

    if (!chatSession) {
      // This shouldn't happen in normal flow (createChatSession is called
      // by the upload endpoint), but we handle it gracefully.
      const { chatSessionId } = await createChatSession(sessionId, '')
      chatSession = { id: chatSessionId, opening_question: '' }
    }

    const chatSessionId = chatSession.id

    // ── 3. Load conversation history from Supabase ───────────────────────────
    const historyRows     = await getMessages(chatSessionId)
    const messageHistory  = buildMessageHistory(historyRows)

    // ── 4. RAG: retrieve relevant context for this message ───────────────────
    const ragDocs = await similaritySearch(userText, sessionId)
    const context = formatContext(ragDocs)
    const ragSources = ragDocs.map((doc) => ({
      source:  doc.metadata.source,
      excerpt: doc.pageContent.slice(0, 180).replace(/\s+/g, ' '),
    }))

    // ── 5. Build prompt & call LLM ───────────────────────────────────────────
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(FOLLOW_UP_SYSTEM),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ])

    const chain = prompt.pipe(getLLM()).pipe(new StringOutputParser())

    const aiReply = await chain.invoke({
      context,
      history: messageHistory,
      input:   userText,
    })

    const replyText = aiReply.trim()

    // ── 6. Persist both turns into chat_messages ─────────────────────────────
    await appendMessages(chatSessionId, [
      { role: 'user',      content: userText,   ragSources: null      },
      { role: 'assistant', content: replyText,  ragSources: ragSources },
    ])

    // ── 7. Respond ───────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      data: {
        reply:      replyText,
        ragSources,
        sessionId,
        chatSessionId,
      },
    })
  } catch (err) {
    next(err)
  }
}
