import React from 'react'
import Logo from '@/components/ui/Logo.jsx'

/**
 * Footer
 * Minimal footer with brand and attribution.
 */
export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-slate text-xs font-mono">
          © {new Date().getFullYear()} Deep-Dive Interviewer — Phase 1
        </p>
      </div>
    </footer>
  )
}
