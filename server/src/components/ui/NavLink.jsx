import React from 'react'
import { NavLink as RouterNavLink } from 'react-router-dom'

/**
 * NavLink
 * Thin wrapper around React Router's NavLink that applies
 * our design-system "nav-link" class and active state.
 */
export default function NavLink({ to, children }) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'active' : ''}`
      }
    >
      {children}
    </RouterNavLink>
  )
}
