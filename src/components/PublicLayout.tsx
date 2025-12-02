/**
 * Public Layout
 * For unauthenticated users - Home, Report, Hotspots only
 */

import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Shield } from 'lucide-react'
import { cn } from '../lib/utils'

const publicNavItems = [
  { name: 'Home', path: '/' },
  { name: 'Report Accident', path: '/report' },
  { name: 'Hotspots', path: '/hotspots' },
]

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="/pahal-logo.png"
                alt="Pahal"
                className="h-24 w-auto"
              />
            </Link>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1">
              {publicNavItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Admin Login Link */}
            <Link
              to="/admin"
              className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
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
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden border-t border-gray-100 bg-white rounded-b-2xl shadow-lg overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {publicNavItems.map((item) => {
                  const isActive = location.pathname === item.path
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
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Admin Login</span>
                </Link>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/pahal-logo.png" alt="Pahal" className="h-24 w-auto" />
            </div>
            <p className="text-gray-500 text-sm text-center md:text-right">
              © 2024 Pahal. All rights reserved. Made with ❤️ for public safety.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
