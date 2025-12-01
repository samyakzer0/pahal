import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Bell, Shield, 
  FileText, Clock, CheckCircle, Edit2, Camera,
  ChevronRight, LogOut, Settings, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'

export default function Profile() {
  const [activeTab, setActiveTab] = useState('reports')

  // Mock user data
  const user = {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'New Delhi, India',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
    joinedDate: 'Member since Oct 2024',
    reportsSubmitted: 5,
    reportsResolved: 4,
  }

  // Mock reports
  const myReports = [
    {
      id: '1',
      title: 'Road Accident on NH-44',
      status: 'resolved',
      date: '2024-11-28',
      location: 'NH-44, Near Toll Plaza',
    },
    {
      id: '2',
      title: 'Vehicle Collision',
      status: 'responding',
      date: '2024-11-30',
      location: 'MG Road, Sector 15',
    },
    {
      id: '3',
      title: 'Minor Accident Report',
      status: 'active',
      date: '2024-12-01',
      location: 'Ring Road, Exit 7',
    },
  ]

  const menuItems = [
    { icon: Settings, label: 'Settings', href: '#' },
    { icon: Bell, label: 'Notifications', href: '#' },
    { icon: HelpCircle, label: 'Help & Support', href: '#' },
    { icon: LogOut, label: 'Logout', href: '/login', danger: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-2xl bg-gray-100"
              />
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-sm">{user.joinedDate}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {user.phone}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                {user.location}
              </div>
            </div>

            {/* Edit Button */}
            <Button variant="outline" className="gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <p className="text-3xl font-bold text-blue-600">{user.reportsSubmitted}</p>
              <p className="text-sm text-gray-600">Reports Submitted</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-2xl">
              <p className="text-3xl font-bold text-green-600">{user.reportsResolved}</p>
              <p className="text-sm text-gray-600">Reports Resolved</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar Menu */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${
                  item.danger 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </a>
            ))}
          </motion.div>

          {/* Reports List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                My Reports
              </h2>

              <div className="space-y-3">
                {myReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{report.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {report.date}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {report.location}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={report.status} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {myReports.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No reports submitted yet</p>
                  <Button className="mt-4">Submit Your First Report</Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
