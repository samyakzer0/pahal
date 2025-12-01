import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/authContext'

// Layouts
import PublicLayout from './components/PublicLayout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Home from './pages/Home'
import Report from './pages/Report'
import Hotspots from './pages/Hotspots'

// Admin Pages
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Analytics from './pages/Analytics'
import SmartCamera from './pages/SmartCamera'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes - No login required */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="report" element={<Report />} />
          <Route path="hotspots" element={<Hotspots />} />
        </Route>

        {/* Admin Login - Not protected */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Protected Admin Routes - Require authentication */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<Home />} />
          <Route path="reports" element={<Report />} />
          <Route path="hotspots" element={<Hotspots />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="smart-camera" element={<SmartCamera />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
