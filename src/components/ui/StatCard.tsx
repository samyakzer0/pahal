import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: string
  trendUp?: boolean
  className?: string
  iconBg?: string
  iconColor?: string
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        'bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium mt-2',
                trendUp ? 'text-green-600' : 'text-red-600'
              )}
            >
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={cn('p-3 rounded-xl', iconBg)}
          >
            <Icon className={cn('w-6 h-6', iconColor)} />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
