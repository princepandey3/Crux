/**
 * src/components/chat/ChatInput.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The input bar at the bottom of the chat.
 *
 * Props:
 *   value       string
 *   onChange    (e) => void
 *   onKeyDown   (e) => void
 *   onSend      () => void
 *   disabled    boolean
 */

import React from 'react'
import { SendHorizonal } from 'lucide-react'

export default function ChatInput({ value, onChange, onKeyDown, onSend, disabled }) {
  return (
    <div className="flex items-end gap-3 p-4 border-t border-white/[0.08] bg-ink/80 backdrop-blur-sm">
      <textarea
        className={`
          flex-1 resize-none rounded-xl px-4 py-3 text-sm
          bg-white/[0.05] border border-white/[0.09]
          text-fog placeholder-slate/40
          focus:outline-none focus:border-accent/50 focus:bg-white/[0.07]
          transition-all duration-200
          min-h-[44px] max-h-[140px]
          leading-relaxed
          disabled:opacity-40
        `}
        rows={1}
        placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-label="Chat input"
        // Auto-grow
        onInput={(e) => {
          e.target.style.height = 'auto'
          e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`
        }}
      />

      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
          transition-all duration-200
          ${
            disabled || !value.trim()
              ? 'bg-white/[0.04] border border-white/[0.06] text-slate/30 cursor-not-allowed'
              : 'bg-accent text-white border border-accent hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25 active:scale-95'
          }
        `}
      >
        <SendHorizonal size={15} />
      </button>
    </div>
  )
}
