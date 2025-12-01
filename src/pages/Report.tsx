import React from 'react'
import { motion } from 'framer-motion'
import ReportForm from '../components/forms/ReportForm'

export default function Report() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Report an Incident
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Submit Your Report
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Help us respond faster by providing accurate information about the incident.
            Your report helps save lives.
          </p>
        </motion.div>

        {/* Report Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ReportForm />
        </motion.div>
      </div>
    </div>
  )
}
