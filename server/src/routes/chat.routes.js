/**
 * src/routes/chat.routes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/chat  — handle an incoming candidate message
 */

import { Router }     from 'express'
import { handleChat } from '../controllers/chat.controller.js'

const router = Router()

/**
 * POST /api/chat
 *
 * Body (application/json):
 *   sessionId   string   interview_session uuid (from Phase 4 upload response)
 *   message     string   the candidate's latest reply
 *
 * Response:
 *   { success: true, data: { reply, ragSources, sessionId, chatSessionId } }
 */
router.post('/chat', handleChat)

export default router
