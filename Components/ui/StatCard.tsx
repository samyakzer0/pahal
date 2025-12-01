import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, trend, trendUp, className }) {
  return (
    <div className={cn(
      'bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs font-medium mt-2',
              trendUp ? 'text-green-600' : 'text-red-600'
            )}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-blue-50 rounded-xl">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}