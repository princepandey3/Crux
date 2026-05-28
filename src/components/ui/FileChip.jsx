import React from 'react'
import { FileText, X } from 'lucide-react'

/**
 * FileChip
 * Compact pill that displays an accepted file name + size
 * with an accessible remove button.
 */
function formatBytes(bytes) {
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default function FileChip({ file, onRemove, className = '' }) {
  return (
    <div
      className={`
        inline-flex items-center gap-2.5
        px-3 py-2 rounded-xl
        bg-accent/10 border border-accent/20
        max-w-full
        ${className}
      `}
    >
      <FileText size={14} className="flex-shrink-0 text-accent" />
      <span className="font-mono text-xs text-fog truncate min-w-0">
        {file.name}
      </span>
      <span className="font-mono text-[10px] text-slate flex-shrink-0">
        {formatBytes(file.size)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="
          flex-shrink-0 flex items-center justify-center
          w-4 h-4 rounded-full
          text-slate hover:text-pulse hover:bg-pulse/10
          transition-colors duration-150
        "
      >
        <X size={10} />
      </button>
    </div>
  )
}
