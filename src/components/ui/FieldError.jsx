import React from 'react'
import { AlertCircle } from 'lucide-react'

/**
 * FieldError
 * Renders an accessible inline validation message beneath a field.
 * Pass `id` so the parent input can wire aria-describedby.
 */
export default function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1.5 mt-2 text-pulse text-xs font-mono"
    >
      <AlertCircle size={12} className="flex-shrink-0" />
      {message}
    </p>
  )
}
