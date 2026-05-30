/**
 * src/hooks/useChat.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages all state for an active interview chat session.
 *
 * Responsibilities:
 *  - Holds the messages array and input text
 *  - Calls POST /api/chat to send a candidate message and receive the AI reply
 *  - Auto-scrolls the message list on new messages
 *  - Tracks loading / error state
 *
 * Usage:
 *   const chat = useChat({ sessionId, openingQuestion })
 */

import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * @param {{ sessionId: string, openingQuestion: string }} params
 */
export function useChat({ sessionId, openingQuestion }) {
  // Full message history – each entry: { id, role, content, isLoading? }
  const [messages, setMessages] = useState(() => {
    if (!openingQuestion) return []
    return [
      {
        id: 'opening',
        role: 'assistant',
        content: openingQuestion,
        isLoading: false,
      },
    ]
  })

  const [inputText, setInputText]   = useState('')
  const [isSending, setIsSending]   = useState(false)
  const [error, setError]           = useState(null)

  // Used to auto-scroll the messages container to the bottom
  const bottomRef = useRef(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const appendMessage = (msg) =>
    setMessages((prev) => [...prev, msg])

  const replaceLastMessage = (updater) =>
    setMessages((prev) => {
      const next = [...prev]
      next[next.length - 1] = updater(next[next.length - 1])
      return next
    })

  // ── Send a candidate reply ────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = inputText.trim()
    if (!text || isSending) return

    setError(null)
    setInputText('')

    // 1. Optimistically append the user's message
    const userMsg = {
      id:        `user-${Date.now()}`,
      role:      'user',
      content:   text,
      isLoading: false,
    }
    appendMessage(userMsg)

    // 2. Add a placeholder "thinking" bubble for the AI
    const thinkingId = `ai-${Date.now()}`
    appendMessage({
      id:        thinkingId,
      role:      'assistant',
      content:   '',
      isLoading: true,
    })

    setIsSending(true)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId, message: text }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error ${res.status}`)
      }

      // 3. Replace the placeholder with the real AI reply
      replaceLastMessage(() => ({
        id:         thinkingId,
        role:       'assistant',
        content:    json.data.reply,
        isLoading:  false,
        ragSources: json.data.ragSources ?? [],
      }))
    } catch (err) {
      // Remove the placeholder and surface the error
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId))
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }, [inputText, isSending, sessionId])

  // ── Keyboard shortcut: Enter to send, Shift+Enter for newline ────────────
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage]
  )

  return {
    messages,
    inputText,
    isSending,
    error,
    bottomRef,
    setInputText,
    sendMessage,
    onKeyDown,
  }
}
