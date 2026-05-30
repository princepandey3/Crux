/**
 * src/components/chat/ChatInterface.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The full chat UI for an active interview session.
 *
 * Props:
 *   sessionId        string   — the interview_session id from Phase 4 upload
 *   openingQuestion  string   — pre-generated opening question (shown immediately)
 *   onEndInterview   () => void  — callback when user ends the session
 */

import React from 'react'
import { AlertCircle, LogOut, Mic2 } from 'lucide-react'
import { useChat } from '@/hooks/useChat.js'
import ChatMessage from './ChatMessage.jsx'
import ChatInput   from './ChatInput.jsx'
import StatusBadge from '@/components/ui/StatusBadge.jsx'

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 py-16">
      <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
        <Mic2 size={22} className="text-accent/70" />
      </div>
      <p className="text-slate text-sm max-w-xs leading-relaxed">
        Your interviewer is ready. Type your first message to begin.
      </p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatInterface({ sessionId, openingQuestion, onEndInterview }) {
  const {
    messages,
    inputText,
    isSending,
    error,
    bottomRef,
    setInputText,
    sendMessage,
    onKeyDown,
  } = useChat({ sessionId, openingQuestion })

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] flex-shrink-0">
        <div className="flex items-center gap-3">
          <StatusBadge variant="accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
            Live Interview
          </StatusBadge>
          <span className="font-mono text-[10px] text-slate/40 hidden sm:block">
            session: {sessionId?.slice(0, 8)}…
          </span>
        </div>

        {onEndInterview && (
          <button
            type="button"
            onClick={onEndInterview}
            className="btn-ghost text-xs py-1.5 px-3 text-slate/60 hover:text-pulse hover:border-pulse/30"
          >
            <LogOut size={12} />
            End interview
          </button>
        )}
      </div>

      {/* ── Message list ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-0"
        role="log"
        aria-label="Interview conversation"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isLoading={msg.isLoading}
              ragSources={msg.ragSources}
            />
          ))
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-fade-up">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0">
        <ChatInput
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={onKeyDown}
          onSend={sendMessage}
          disabled={isSending}
        />
      </div>
    </div>
  )
}
