import React, { useId, useRef } from 'react'
import { UploadCloud, FileWarning, CheckCircle2 } from 'lucide-react'
import FileChip from '@/components/ui/FileChip.jsx'
import FieldError from '@/components/ui/FieldError.jsx'

/**
 * ResumeDropZone
 * Accessible drag-and-drop zone for PDF résumé upload.
 *
 * Props:
 *  file          – File | null
 *  dragState     – 'idle' | 'over' | 'reject'
 *  error         – string | undefined
 *  onDragEnter, onDragLeave, onDragOver, onDrop
 *  onInputChange – file input change handler
 *  onRemove      – clears the accepted file
 */
export default function ResumeDropZone({
  file,
  dragState,
  error,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onInputChange,
  onRemove,
}) {
  const inputRef  = useRef(null)
  const inputId   = useId()
  const errorId   = useId()

  const stateStyles = {
    idle:   'border-white/[0.12] hover:border-accent/40 hover:bg-accent/[0.03]',
    over:   'border-accent/60 bg-accent/[0.06] scale-[1.01]',
    reject: 'border-pulse/60 bg-pulse/[0.06]',
  }

  return (
    <div>
      {/* Section label */}
      <div className="flex items-center justify-between mb-3">
        <label
          htmlFor={inputId}
          className="label-mono cursor-pointer"
        >
          01 — Résumé
        </label>
        <span className="font-mono text-[10px] text-slate">PDF only · max 10 MB</span>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop your résumé PDF here, or click to browse"
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !file && inputRef.current?.click()}
        className={`
          relative w-full rounded-2xl border-2 border-dashed
          transition-all duration-200 cursor-pointer
          outline-none focus-visible:ring-2 focus-visible:ring-accent/50
          ${file ? 'border-accent/30 bg-accent/[0.04] cursor-default' : stateStyles[dragState]}
          ${error && !file ? 'border-pulse/40' : ''}
        `}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={onInputChange}
          aria-hidden="true"
        />

        <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center select-none">
          {/* Idle / over / reject states */}
          {!file && dragState === 'idle'   && <UploadCloud   size={32} className="text-slate/60" />}
          {!file && dragState === 'over'   && <UploadCloud   size={32} className="text-accent animate-bounce" />}
          {!file && dragState === 'reject' && <FileWarning   size={32} className="text-pulse" />}

          {/* File accepted */}
          {file && (
            <>
              <CheckCircle2 size={28} className="text-emerald-400" />
              <FileChip file={file} onRemove={onRemove} />
              <p className="text-slate text-xs mt-1">
                Click the × to swap your résumé.
              </p>
            </>
          )}

          {/* Prompt text (no file) */}
          {!file && (
            <>
              <div>
                <p className="text-fog/80 text-sm font-medium">
                  {dragState === 'over'
                    ? 'Release to upload'
                    : dragState === 'reject'
                    ? 'PDFs only — try again'
                    : 'Drop your résumé here'}
                </p>
                <p className="text-slate text-xs mt-1">
                  or{' '}
                  <span className="text-accent underline underline-offset-2">
                    browse files
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <FieldError id={errorId} message={error} />
    </div>
  )
}
