import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from '@/pages/HomePage.jsx'
import DashboardPage from '@/pages/DashboardPage.jsx'

/**
 * AppRoutes
 * Central route registry. Add new routes here as phases expand.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* Catch-all redirect */}
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  )
}
