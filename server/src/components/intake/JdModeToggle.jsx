import React from 'react'
import { AlignLeft, FileUp } from 'lucide-react'

const MODES = [
  { key: 'text', label: 'Paste Text', Icon: AlignLeft  },
  { key: 'file', label: 'Upload File', Icon: FileUp    },
]

/**
 * JdModeToggle
 * Two-button segmented control to switch between
 * pasting the JD as plain text or uploading a file.
 */
export default function JdModeToggle({ mode, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Job description input method"
      className="inline-flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]"
    >
      {MODES.map(({ key, label, Icon }) => (
        <button
          key={key}
          role="tab"
          type="button"
          aria-selected={mode === key}
          onClick={() => onChange(key)}
          className={`
            flex items-center gap-1.5 px-4 py-1.5 rounded-lg
            font-mono text-xs transition-all duration-200
            ${mode === key
              ? 'bg-accent text-white shadow-sm shadow-accent/30'
              : 'text-slate hover:text-fog'}
          `}
        >
          <Icon size={12} />
          {label}
        </button>
      ))}
    </div>
  )
}
