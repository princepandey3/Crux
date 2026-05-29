import React from 'react'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

/**
 * RootLayout
 * Provides the persistent shell: Navbar → {page content} → Footer.
 * The background grid and ambient blobs live here so every
 * page inherits the same atmospheric treatment.
 */
export default function RootLayout({ children }) {
  return (
    <div className="relative min-h-dvh flex flex-col overflow-x-hidden">

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-subtle bg-grid opacity-60"
        aria-hidden="true"
      />

      {/* Ambient color blobs */}
      <div
        className="pointer-events-none fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/5 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-pulse/4 blur-[100px]"
        aria-hidden="true"
      />

      {/* Shell */}
      <Navbar />
      <main className="relative z-10 flex-1 flex flex-col">
        {children}
      </main>
      <Footer />

    </div>
  )
}
