import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, BrainCircuit, MessageSquareCode, Zap } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge.jsx'

/* ─── Feature card data ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: FileText,
    title: 'Resume Parsing',
    body: 'Drop your PDF. The system extracts skills, experience, and projects to build a targeted question bank.',
    phase: 'Phase 2',
  },
  {
    icon: BrainCircuit,
    title: 'RAG-Powered Context',
    body: 'Your resume and the job description are embedded and retrieved in real-time to craft hyper-relevant questions.',
    phase: 'Phase 3',
  },
  {
    icon: MessageSquareCode,
    title: 'Live Mock Interview',
    body: 'A conversational AI interviewer adapts follow-ups based on your answers, just like the real thing.',
    phase: 'Phase 4',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    body: 'Receive structured post-interview analysis: strengths, blind spots, and suggested study topics.',
    phase: 'Phase 5',
  },
]

/* ─── Sub-components ────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">

      <div className="animate-fade-up">
        <StatusBadge variant="accent" className="mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          Now in Development
        </StatusBadge>
      </div>

      <h1 className="animate-fade-up animate-delay-100 font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-gradient mb-6">
        Ace your next<br />
        technical interview.
      </h1>

      <p className="animate-fade-up animate-delay-200 max-w-xl mx-auto text-slate text-lg leading-relaxed mb-10">
        Upload your résumé, paste a job description, and step into a{' '}
        <span className="text-fog/80">RAG-powered mock interview</span> tailored
        exactly to the role you're targeting.
      </p>

      <div className="animate-fade-up animate-delay-300 flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard" className="btn-primary text-base px-6 py-3">
          Open Dashboard
          <ArrowRight size={16} />
        </Link>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-base px-6 py-3"
        >
          View on GitHub
        </a>
      </div>

      {/* Decorative terminal preview */}
      <TerminalPreview />
    </section>
  )
}

function TerminalPreview() {
  return (
    <div className="animate-fade-up animate-delay-400 mt-16 mx-auto max-w-2xl glass-card p-0 overflow-hidden text-left">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
        <span className="w-3 h-3 rounded-full bg-pulse/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/50" />
        <span className="ml-3 font-mono text-xs text-slate">interview_session.log</span>
      </div>
      {/* Content */}
      <div className="p-5 font-mono text-sm space-y-2">
        <p>
          <span className="text-accent">system</span>
          <span className="text-slate mx-2">›</span>
          <span className="text-fog/80">Loading resume context...</span>
          <span className="text-emerald-400 ml-2">✓</span>
        </p>
        <p>
          <span className="text-accent">system</span>
          <span className="text-slate mx-2">›</span>
          <span className="text-fog/80">Matching job description (Senior React Engineer)</span>
          <span className="text-emerald-400 ml-2">✓</span>
        </p>
        <p>
          <span className="text-pulse">interviewer</span>
          <span className="text-slate mx-2">›</span>
          <span className="text-fog/90">Tell me about a time you optimised a React render cycle at scale.</span>
        </p>
        <p className="flex items-center gap-1">
          <span className="text-slate">you</span>
          <span className="text-slate mx-2">›</span>
          <span className="text-slate/60 italic">waiting for your response</span>
          <span className="animate-blink text-accent font-bold">|</span>
        </p>
      </div>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center mb-14">
        <p className="label-mono mb-3">How it works</p>
        <h2 className="font-display text-3xl sm:text-4xl text-fog">
          Built for depth, not breadth.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(({ icon: Icon, title, body, phase }, i) => (
          <FeatureCard
            key={title}
            icon={Icon}
            title={title}
            body={body}
            phase={phase}
            delay={i * 100}
          />
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, body, phase, delay }) {
  return (
    <article
      className="glass-card p-6 flex flex-col gap-4 hover:border-accent/20 transition-colors duration-300 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/15">
          <Icon size={18} className="text-accent" />
        </span>
        <StatusBadge>{phase}</StatusBadge>
      </div>
      <div>
        <h3 className="font-display text-lg text-fog mb-1.5">{title}</h3>
        <p className="text-slate text-sm leading-relaxed">{body}</p>
      </div>
    </article>
  )
}

/* ─── Page export ───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  )
}
