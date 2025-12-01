import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Home, Map, LayoutDashboard, BarChart3, 
  Menu, X, AlertTriangle, LogOut, User, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const publicNavItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Hotspots', icon: Map, page: 'Hotspots' },
];

const adminNavItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'AdminDashboard' },
  { name: 'Analytics', icon: BarChart3, page: 'Analytics' },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (isAuthenticated) {
          const userData = await base44.auth.me();
          setUser(userData);
          setIsAdmin(userData.role === 'admin');
        }
      } catch (e) {
        console.log('Not authenticated');
      }
    };
    checkAuth();
  }, []);

  const navItems = isAdmin ? [...publicNavItems, ...adminNavItems] : publicNavItems;

  const isAdminPage = ['AdminDashboard', 'Analytics'].includes(currentPageName);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        :root {
          --primary: #3b82f6;
          --primary-dark: #2563eb;
          --danger: #dc2626;
          --success: #22c55e;
          --warning: #f97316;
        }
        
        .nav-link {
          transition: all 0.2s ease;
        }
        
        .nav-link:hover {
          background: rgba(59, 130, 246, 0.08);
        }
        
        .nav-link.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
          color: #3b82f6;
        }
      `}</style>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Pahal
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`nav-link flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                    currentPageName === item.page
                      ? 'active'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    {isAdmin && <Shield className="w-4 h-4 text-blue-600" />}
                    <span className="text-sm font-medium text-gray-700">{user.full_name || user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => base44.auth.redirectToLogin()}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      currentPageName === item.page
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-gray-100">
                  {user ? (
                    <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-2">
                        {isAdmin && <Shield className="w-4 h-4 text-blue-600" />}
                        <span className="text-sm font-medium">{user.full_name || user.email}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full rounded-xl"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      {!isAdminPage && (
        <footer className="bg-white border-t border-gray-100 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Pahal</span>
              </div>
              
              <p className="text-sm text-gray-500">
                Making roads safer, one response at a time.
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <a href="tel:112" className="hover:text-gray-700">Emergency: 112</a>
                <span>•</span>
                <span>© 2024 Pahal</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}