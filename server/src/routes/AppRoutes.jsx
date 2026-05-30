import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage      from '@/pages/HomePage.jsx'
import DashboardPage from '@/pages/DashboardPage.jsx'
import ChatPage      from '@/pages/ChatPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/chat"      element={<ChatPage />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  )
}
