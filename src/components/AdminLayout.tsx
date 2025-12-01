/**
 * Admin Layout
 * For authenticated admin users - Full access to all pages
 */

import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  LogOut,
  Home,
  MapPin,
  LayoutDashboard,
  Camera,
  BarChart3,
  AlertTriangle,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/authContext'
import { Button } from '@/components/ui/Button'

const adminNavItems = [
  { name: 'Home', path: '/admin/home', icon: Home },
  { name: 'Reports', path: '/admin/reports', icon: AlertTriangle },
  { name: 'Hotspots', path: '/admin/hotspots', icon: MapPin },
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Smart Camera', path: '/admin/smart-camera', icon: Camera },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
]

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { admin, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/admin/dashboard" className="flex-shrink-0 flex items-center gap-2">
              <img
                src="/pahal-logo.png"
                alt="Pahal"
                className="h-20 w-auto"
              />
              <span className="hidden sm:block text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                ADMIN
              </span>
            </Link>

            {/* Center Navigation */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1">
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{admin?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{admin?.role?.replace('_', ' ')}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                {/* User info */}
                <div className="px-4 py-3 mb-2 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-900">{admin?.full_name}</p>
                  <p className="text-sm text-gray-500 capitalize">{admin?.role?.replace('_', ' ')}</p>
                </div>

                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.path
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              Admin Portal • {admin?.email}
            </p>
            <p className="text-gray-400 text-xs">
              © 2024 Pahal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
