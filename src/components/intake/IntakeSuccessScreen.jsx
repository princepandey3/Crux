import React from 'react'
import { CheckCircle2, RotateCcw, Terminal } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge.jsx'

/**
 * IntakeSuccessScreen
 * Shown in place of the form after a successful submission.
 * Signals the payload was captured and hints at next steps.
 */
export default function IntakeSuccessScreen({ resumeFile, onReset }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-4 gap-6 animate-fade-up">

      {/* Icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 size={30} className="text-emerald-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Terminal size={10} className="text-accent" />
        </div>
      </div>

      {/* Copy */}
      <div>
        <StatusBadge variant="success" className="mb-3">Intake Complete</StatusBadge>
        <h3 className="font-display text-2xl text-fog mb-2">
          Payload captured.
        </h3>
        <p className="text-slate text-sm max-w-xs leading-relaxed">
          Your résumé and job description have been logged to the console.
          Backend ingestion will be wired in Phase 3.
        </p>
      </div>

      {/* Console hint */}
      <div className="glass-card px-5 py-3 text-left w-full max-w-sm">
        <p className="font-mono text-[11px] text-slate mb-1 tracking-wide">CONSOLE OUTPUT</p>
        <p className="font-mono text-xs text-fog/70">
          <span className="text-accent">[Deep-Dive]</span> Intake Form Submitted
        </p>
        <p className="font-mono text-xs text-slate mt-0.5">
          resume: <span className="text-fog/60">{resumeFile?.name}</span>
        </p>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={onReset}
        className="btn-ghost text-sm"
      >
        <RotateCcw size={14} />
        Start over
      </button>
    </div>
  )
}
