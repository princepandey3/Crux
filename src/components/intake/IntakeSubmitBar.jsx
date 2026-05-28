import React from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

/**
 * IntakeSubmitBar
 * Bottom action bar: readiness checklist dots + submit CTA.
 */
export default function IntakeSubmitBar({ isReady, hasResume, hasJd }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">

      {/* Readiness indicators */}
      <div className="flex items-center gap-4">
        <Dot label="Résumé"          done={hasResume} />
        <Dot label="Job Description" done={hasJd}     />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isReady}
        className={`
          inline-flex items-center gap-2
          px-6 py-3 rounded-xl
          font-medium text-sm
          transition-all duration-200
          ${isReady
            ? 'bg-accent text-white hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25 active:scale-[0.97]'
            : 'bg-white/[0.05] text-slate/50 cursor-not-allowed border border-white/[0.08]'}
        `}
      >
        Start Interview Setup
        <ArrowRight size={15} />
      </button>
    </div>
  )
}

function Dot({ label, done }) {
  return (
    <div className="flex items-center gap-1.5">
      {done
        ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
        : <span className="w-3.5 h-3.5 rounded-full border border-white/[0.15] flex-shrink-0" />
      }
      <span className={`font-mono text-[11px] ${done ? 'text-fog/70' : 'text-slate/50'}`}>
        {label}
      </span>
    </div>
  )
}
