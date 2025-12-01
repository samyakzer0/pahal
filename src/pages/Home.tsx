import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  MapPin,
  Phone,
  Shield,
  Zap,
  Users,
  ChevronRight,
  Play,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import ReportForm from '@/components/forms/ReportForm'

export default function Home() {
  const [showReportDialog, setShowReportDialog] = useState(false)

  const stats = [
    { value: '< 3min', label: 'Avg. Response Time' },
    { value: '10K+', label: 'Incidents Tracked' },
    { value: '500+', label: 'Hotspots Mapped' },
    { value: '95%', label: 'Resolution Rate' },
  ]

  const steps = [
    {
      icon: AlertTriangle,
      title: 'Detect',
      description: 'AI cameras detect accidents automatically or citizens report manually',
    },
    {
      icon: MapPin,
      title: 'Locate',
      description: 'Precise location via DigiPin ensures responders find the exact spot',
    },
    {
      icon: Shield,
      title: 'Dispatch',
      description: 'Emergency services are notified and dispatched immediately',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920')] opacity-10 bg-cover bg-center" />

        {/* Floating elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.25, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live Monitoring Active
              </motion.div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Saving Lives Through
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Faster Response
                </span>
              </h1>

              <p className="text-lg text-blue-100 mb-8 max-w-lg">
                AI-powered accident detection and emergency response platform. Report incidents,
                track hotspots, and help save lives in your community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={() => setShowReportDialog(true)}
                    className="h-14 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
                  >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Report an Accident
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/hotspots">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-8 rounded-full bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold backdrop-blur-sm"
                    >
                      <MapPin className="w-5 h-5 mr-2" />
                      View Hotspots
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl opacity-20 blur-2xl" />
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center"
                    >
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="text-white font-semibold">Live Alert</h4>
                      <p className="text-blue-200 text-sm">Accident detected on NH-44</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white/10 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-white font-medium">AI Detection</p>
                        <p className="text-blue-200 text-xs">Vehicle collision identified</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="bg-white/10 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-300" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Responders Dispatched</p>
                        <p className="text-blue-200 text-xs">ETA: 4 minutes</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                      className="bg-white/10 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Priority: High</p>
                        <p className="text-blue-200 text-xs">2 casualties reported</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
          >
            How Pahal Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            A comprehensive platform combining AI technology with community involvement to create a
            safer environment for everyone.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <step.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-4xl font-bold text-gray-100 group-hover:text-blue-100 transition-colors">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920')] opacity-5 bg-cover bg-center" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Every Second Counts
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                Your report can save lives. Help us create a safer community by reporting accidents
                quickly and accurately.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => setShowReportDialog(true)}
                  className="h-14 px-10 rounded-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-xl"
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Report Now
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              Report an Accident
            </DialogTitle>
          </DialogHeader>
          <ReportForm
            onSuccess={() => setShowReportDialog(false)}
            onCancel={() => setShowReportDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
