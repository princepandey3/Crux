/**
 * src/components/intake/IntakeSuccessScreen.jsx  (Phase 5)
 * ─────────────────────────────────────────────────────────────────────────────
 * FIX: removed manual encodeURIComponent() on question — URLSearchParams
 * already encodes values, so double-encoding caused garbled text on ChatPage.
 */

import React from 'react'
import { CheckCircle2, RotateCcw, MessageSquare, BookOpen, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '@/components/ui/StatusBadge.jsx'

export default function IntakeSuccessScreen({ resumeFile, apiResult, onReset }) {
  const navigate = useNavigate()

  function startInterview() {
    if (!apiResult?.sessionId || !apiResult?.question) return
    // FIX: URLSearchParams encodes values automatically — do NOT wrap in encodeURIComponent
    const params = new URLSearchParams({
      sessionId: apiResult.sessionId,
      question:  apiResult.question,
    })
    navigate(`/chat?${params.toString()}`)
  }

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

      {/* Opening question preview */}
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

      {/* RAG source excerpts */}
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

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
        <button
          type="button"
          onClick={startInterview}
          disabled={!apiResult?.sessionId}
          className="btn-primary w-full sm:flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Interview
          <ArrowRight size={15} />
        </button>

        <button
          type="button"
          onClick={onReset}
          className="btn-ghost w-full sm:flex-1 justify-center"
        >
          <RotateCcw size={14} />
          Start over
        </button>
      </div>
    </div>
  )
}
