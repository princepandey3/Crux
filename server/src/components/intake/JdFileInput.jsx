import React, { useId, useRef } from 'react'
import { FileUp } from 'lucide-react'
import FileChip from '@/components/ui/FileChip.jsx'
import FieldError from '@/components/ui/FieldError.jsx'

/**
 * JdFileInput
 * Simple file picker for uploading a JD as a document.
 * Accepts PDF, .doc, .docx, and plain text files.
 */
const ACCEPTED = '.pdf,.doc,.docx,.txt,application/pdf,text/plain'

export default function JdFileInput({ file, onChange, onRemove, error }) {
  const inputRef = useRef(null)
  const inputId  = useId()
  const errorId  = useId()

  return (
    <div>
      {file ? (
        <div className="flex flex-col gap-2">
          <FileChip file={file} onRemove={onRemove} />
          <p className="text-slate text-xs">
            File ready.{' '}
            <button
              type="button"
              onClick={onRemove}
              className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
            >
              Replace
            </button>
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className={`
            w-full flex items-center justify-center gap-3
            rounded-xl border-2 border-dashed py-8
            text-sm transition-all duration-200
            outline-none focus-visible:ring-2 focus-visible:ring-accent/50
            hover:border-accent/40 hover:bg-accent/[0.03]
            ${error ? 'border-pulse/40' : 'border-white/[0.12]'}
          `}
        >
          <FileUp size={20} className="text-slate/60" />
          <span className="text-fog/70">
            Click to upload JD file
          </span>
          <span className="text-slate text-xs">PDF, DOC, DOCX, TXT</span>
        </button>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={onChange}
        aria-hidden="true"
      />

      <FieldError id={errorId} message={error} />
    </div>
  )
}
