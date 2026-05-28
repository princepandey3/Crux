import React from 'react'
import AppRoutes from '@/routes/AppRoutes.jsx'
import RootLayout from '@/components/layout/RootLayout.jsx'

export default function App() {
  return (
    <RootLayout>
      <AppRoutes />
    </RootLayout>
  )
}
