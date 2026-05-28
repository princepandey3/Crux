import React from 'react'
import DashboardIntakeForm from '@/components/intake/DashboardIntakeForm.jsx'
import StatusBadge         from '@/components/ui/StatusBadge.jsx'

/* ─── Header ────────────────────────────────────────────────── */
function DashboardHeader() {
  return (
    <div className="mb-10 animate-fade-up">
      <StatusBadge variant="accent" className="mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
        Phase 2 — Candidate Intake
      </StatusBadge>
      <h1 className="font-display text-4xl sm:text-5xl text-fog mb-3">
        Interview Setup
      </h1>
      <p className="text-slate max-w-lg leading-relaxed text-sm">
        Upload your résumé and provide the target job description.
        These will be embedded into the RAG pipeline in Phase 3 to
        generate hyper-relevant interview questions.
      </p>
    </div>
  )
}

/* ─── Progress bar ──────────────────────────────────────────── */
function ProgressBar() {
  return (
    <div className="glass-card p-5 mb-8 animate-fade-up animate-delay-100">
      <div className="flex items-center justify-between mb-3">
        <span className="label-mono">Build Progress</span>
        <span className="font-mono text-xs text-slate">Phase 2 / 5</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-1000"
          style={{ width: '40%' }}
        />
      </div>
      <p className="mt-2.5 text-slate text-xs">
        Intake UI complete. RAG ingestion pipeline &amp; embeddings next.
      </p>
    </div>
  )
}

/* ─── Page export ───────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-16">
      <DashboardHeader />
      <ProgressBar />

      {/* Main intake card */}
      <div className="glass-card p-8 animate-fade-up animate-delay-200">
        <DashboardIntakeForm />
      </div>
    </div>
  )
}
