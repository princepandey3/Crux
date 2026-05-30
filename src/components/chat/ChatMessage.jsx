/**
 * src/components/chat/ChatMessage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a single message bubble in the chat UI.
 *
 * Props:
 *   role       'user' | 'assistant'
 *   content    string
 *   isLoading  boolean  — shows the animated typing indicator
 *   ragSources Array<{ source: string, excerpt: string }>  (optional)
 */

import React, { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, User, Bot } from 'lucide-react'

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5" aria-label="AI is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate/60 animate-blink"
          style={{ animationDelay: `${i * 220}ms` }}
        />
      ))}
    </span>
  )
}

// ── RAG source drawer ─────────────────────────────────────────────────────────
function RagSources({ sources }) {
  const [open, setOpen] = useState(false)
  if (!sources?.length) return null

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[10px] font-mono text-slate/50 hover:text-slate/80 transition-colors"
      >
        <BookOpen size={10} />
        {sources.length} source{sources.length !== 1 ? 's' : ''}
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {open && (
        <ul className="mt-2 space-y-1.5 border-l-2 border-white/10 pl-3">
          {sources.map((s, i) => (
            <li key={i} className="text-[10px] text-slate/60 leading-relaxed">
              <span
                className={`font-semibold mr-1 ${
                  s.source === 'resume' ? 'text-accent/70' : 'text-purple-400/70'
                }`}
              >
                [{s.source === 'resume' ? 'Résumé' : 'JD'}]
              </span>
              {s.excerpt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatMessage({ role, content, isLoading, ragSources }) {
  const isUser = role === 'user'

  return (
    <div
      className={`flex gap-3 w-full animate-fade-up ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          isUser
            ? 'bg-accent/20 border border-accent/30'
            : 'bg-white/[0.06] border border-white/10'
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          <User size={12} className="text-accent" />
        ) : (
          <Bot size={12} className="text-slate" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-accent/15 border border-accent/25 text-fog rounded-tr-sm'
            : 'bg-white/[0.05] border border-white/[0.09] text-fog/90 rounded-tl-sm'
        }`}
      >
        {isLoading ? (
          <TypingDots />
        ) : (
          <>
            <p className="whitespace-pre-wrap">{content}</p>
            {!isUser && <RagSources sources={ragSources} />}
          </>
        )}
      </div>
    </div>
  )
}
