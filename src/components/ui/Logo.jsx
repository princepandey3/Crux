import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Logo
 * Brand mark for the navbar and any other usage.
 */
export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group select-none">
      {/* Animated icon mark */}
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors duration-200">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M2 13 L5 4 L8 10 L11 6 L14 13"
            stroke="#4F6EF7"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="3" r="1.2" fill="#E05C3A" />
        </svg>
      </span>

      {/* Wordmark */}
      <span className="font-display text-lg leading-none text-fog">
        Deep<span className="text-accent">Dive</span>
      </span>
    </Link>
  )
}
