import React from 'react'
import { MapPin, Clock, AlertTriangle, ChevronRight, Users } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import StatusBadge from '@/components/ui/StatusBadge'
import { cn } from '@/lib/utils'
import { Incident } from '@/lib/mockData'

interface IncidentCardProps {
  incident: Incident
  onClick?: () => void
  compact?: boolean
}

export default function IncidentCard({ incident, onClick, compact = false }: IncidentCardProps) {
  const isCritical = incident.severity === 'critical'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border transition-all duration-300 cursor-pointer group',
        isCritical
          ? 'border-red-200 shadow-red-100 hover:shadow-red-200 hover:border-red-300'
          : 'border-gray-100 hover:border-gray-200',
        'hover:shadow-lg p-4'
      )}
    >
      <div className="flex items-start gap-4">
        {incident.photo_urls?.[0] && !compact && (
          <img
            src={incident.photo_urls[0]}
            alt="Incident"
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {incident.title || incident.accident_type?.replace('_', ' ')}
            </h3>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-transform group-hover:translate-x-1" />
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={incident.status} type="status" />
            <StatusBadge severity={incident.severity} type="severity" />
          </div>

          <div className="space-y-1.5 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{incident.address || 'Location pending...'}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{format(new Date(incident.created_date), 'MMM d, h:mm a')}</span>
              </div>
              {incident.report_count > 1 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{incident.report_count} reports</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isCritical && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 pt-3 border-t border-red-100 flex items-center gap-2 text-red-600 text-sm font-medium"
        >
          <AlertTriangle className="w-4 h-4 animate-pulse" />
          <span>Critical - Immediate attention required</span>
        </motion.div>
      )}
    </motion.div>
  )
}
