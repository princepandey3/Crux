import React from 'react'
import { CheckCircle2, RotateCcw, MessageSquare, BookOpen } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge.jsx'

/**
 * IntakeSuccessScreen
 * Shown after a successful submission.
 * FIX: now displays the opening interview question and source excerpts
 * from apiResult instead of the stale Phase-2 "logged to console" copy.
 */
export default function IntakeSuccessScreen({ resumeFile, apiResult, onReset }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-4 gap-6 animate-fade-up">

      {/* Icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 size={30} className="text-emerald-400" />
        </div>
      </div>

      {/* Copy */}
      <div>
        <StatusBadge variant="success" className="mb-3">Interview Ready</StatusBadge>
        <h3 className="font-display text-2xl text-fog mb-2">
          Your interview is set up.
        </h3>
        <p className="text-slate text-sm max-w-xs leading-relaxed">
          Resume parsed, job description embedded, opening question generated.
        </p>
      </div>

      {/* FIX: show the generated opening question */}
      {apiResult?.question && (
        <div className="glass-card px-5 py-4 text-left w-full max-w-lg">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={14} className="text-accent" />
            <p className="font-mono text-[11px] text-slate tracking-wide uppercase">
              Opening Interview Question
            </p>
          </div>
          <p className="text-fog/90 text-sm leading-relaxed">
            {apiResult.question}
          </p>
        </div>
      )}

      {/* FIX: show source excerpts used to ground the question */}
      {apiResult?.sources?.length > 0 && (
        <div className="glass-card px-5 py-4 text-left w-full max-w-lg">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-slate" />
            <p className="font-mono text-[11px] text-slate tracking-wide uppercase">
              Grounded from ({apiResult.sources.length} chunks)
            </p>
          </div>
          <ul className="space-y-2">
            {apiResult.sources.map((s, i) => (
              <li key={i} className="text-xs text-slate/70 leading-relaxed">
                <span className={`font-semibold mr-1 ${s.source === 'resume' ? 'text-accent' : 'text-purple-400'}`}>
                  [{s.source === 'resume' ? 'Résumé' : 'JD'}]
                </span>
                {s.excerpt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Session info */}
      {apiResult?.sessionId && (
        <p className="font-mono text-[10px] text-slate/40">
          session: {apiResult.sessionId}
        </p>
      )}

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
