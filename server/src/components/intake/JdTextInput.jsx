import React, { useId } from 'react'
import FieldError from '@/components/ui/FieldError.jsx'

const MAX_CHARS = 8000

/**
 * JdTextInput
 * Controlled textarea for pasting a job description.
 * Shows character count and an accessible error state.
 */
export default function JdTextInput({ value, onChange, error }) {
  const textareaId = useId()
  const errorId    = useId()
  const remaining  = MAX_CHARS - value.length
  const nearLimit  = remaining < 500

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="sr-only">
        Job description text
      </label>

      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        maxLength={MAX_CHARS}
        rows={10}
        placeholder="Paste the full job description here…

Include the role title, responsibilities, required skills, and any technical stack details. The more context you provide, the more targeted your mock interview will be."
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        className={`
          w-full rounded-xl bg-white/[0.03] border
          px-4 py-3.5
          font-body text-sm text-fog/90 placeholder:text-slate/40
          leading-relaxed resize-none
          transition-colors duration-200
          outline-none
          focus:bg-white/[0.05] focus:border-accent/50 focus:ring-1 focus:ring-accent/20
          ${error
            ? 'border-pulse/40 focus:border-pulse/60 focus:ring-pulse/20'
            : 'border-white/[0.10]'}
        `}
      />

      {/* Footer row: error + char count */}
      <div className="flex items-start justify-between gap-4">
        <FieldError id={errorId} message={error} />
        <span
          className={`
            ml-auto font-mono text-[10px] flex-shrink-0
            ${nearLimit ? 'text-pulse' : 'text-slate/50'}
          `}
        >
          {remaining.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
