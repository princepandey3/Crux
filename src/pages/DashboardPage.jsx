import React from 'react'
import { Upload, Briefcase, Settings2, PlayCircle, Construction } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge.jsx'

/* ─── Roadmap steps ─────────────────────────────────────────── */
const STEPS = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Résumé',
    body: 'PDF upload + text extraction pipeline. Parsed content will be chunked and embedded into the vector store.',
    status: 'upcoming',
    phase: 'Phase 2',
  },
  {
    step: '02',
    icon: Briefcase,
    title: 'Paste Job Description',
    body: 'The target JD is embedded alongside your résumé to ground every question in the actual role requirements.',
    status: 'upcoming',
    phase: 'Phase 2',
  },
  {
    step: '03',
    icon: Settings2,
    title: 'Configure Session',
    body: 'Choose difficulty, interview style (behavioural / technical / mixed), duration, and focus domains.',
    status: 'upcoming',
    phase: 'Phase 3',
  },
  {
    step: '04',
    icon: PlayCircle,
    title: 'Begin Interview',
    body: 'Enter the live chat interface. The AI interviewer pulls context via RAG to ask intelligent follow-ups.',
    status: 'upcoming',
    phase: 'Phase 4',
  },
]

/* ─── Sub-components ────────────────────────────────────────── */
function DashboardHeader() {
  return (
    <div className="mb-12 animate-fade-up">
      <StatusBadge variant="pulse" className="mb-4">
        <Construction size={10} />
        Under Construction
      </StatusBadge>
      <h1 className="font-display text-4xl sm:text-5xl text-fog mb-3">
        Interview Dashboard
      </h1>
      <p className="text-slate max-w-lg leading-relaxed">
        This is your interview setup hub. The panels below outline each
        phase of the workflow — they'll become fully interactive as
        development progresses.
      </p>
    </div>
  )
}

function StepCard({ step, icon: Icon, title, body, status, phase, delay }) {
  return (
    <article
      className="glass-card p-6 flex gap-5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Step number */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-0.5">
        <span className="font-mono text-xs text-accent/60">{step}</span>
        <div className="w-px flex-1 bg-white/[0.06]" />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08]">
              <Icon size={15} className="text-fog/60" />
            </span>
            <h3 className="font-display text-lg text-fog">{title}</h3>
          </div>
          <StatusBadge>{phase}</StatusBadge>
        </div>
        <p className="text-slate text-sm leading-relaxed">{body}</p>

        {/* Placeholder action area */}
        <div className="mt-4 h-10 rounded-lg border border-dashed border-white/[0.08] flex items-center justify-center">
          <span className="font-mono text-[11px] text-slate/40 tracking-wide">
            — component placeholder —
          </span>
        </div>
      </div>
    </article>
  )
}

function ProgressBar() {
  return (
    <div className="glass-card p-5 mb-8 animate-fade-up animate-delay-100">
      <div className="flex items-center justify-between mb-3">
        <span className="label-mono">Build Progress</span>
        <span className="font-mono text-xs text-slate">Phase 1 / 5</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-1000"
          style={{ width: '20%' }}
        />
      </div>
      <p className="mt-2.5 text-slate text-xs">
        App shell complete. Résumé ingestion pipeline next.
      </p>
    </div>
  )
}

/* ─── Page export ───────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-16">
      <DashboardHeader />
      <ProgressBar />
      <div className="space-y-4">
        {STEPS.map(({ step, icon, title, body, status, phase }, i) => (
          <StepCard
            key={step}
            step={step}
            icon={icon}
            title={title}
            body={body}
            status={status}
            phase={phase}
            delay={i * 80}
          />
        ))}
      </div>
    </div>
  )
}
