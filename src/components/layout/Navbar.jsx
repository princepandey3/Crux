import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo.jsx'
import NavLink from '@/components/ui/NavLink.jsx'
import StatusBadge from '@/components/ui/StatusBadge.jsx'

const NAV_ITEMS = [
  { label: 'Home',      to: '/'          },
  { label: 'Dashboard', to: '/dashboard' },
]

/**
 * Navbar
 * Sticky top navigation. Gains a frosted border on scroll.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`
        sticky top-0 z-50 w-full
        transition-all duration-300
        ${scrolled
          ? 'bg-ink/80 backdrop-blur-xl border-b border-white/[0.07] shadow-2xl shadow-black/40'
          : 'bg-transparent border-b border-transparent'
        }
      `}
    >
      <nav className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">

        {/* Left — brand */}
        <Logo />

        {/* Center — nav links */}
        <ul className="hidden sm:flex items-center gap-7">
          {NAV_ITEMS.map(({ label, to }) => (
            <li key={to}>
              <NavLink to={to}>{label}</NavLink>
            </li>
          ))}
        </ul>

        {/* Right — CTA */}
        <div className="flex items-center gap-3">
          <StatusBadge variant="accent">Phase 1</StatusBadge>
          <Link to="/dashboard" className="btn-primary hidden sm:inline-flex">
            Start Interview
          </Link>
        </div>

      </nav>
    </header>
  )
}
