import React from 'react';
import { cn } from '@/lib/utils';

const statusConfig = {
  reported: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  acknowledged: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  dispatched: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  en_route: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  on_site: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

const severityConfig = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500 animate-pulse' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  low: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

export default function StatusBadge({ status, severity, type = 'status', className }) {
  const config = type === 'status' ? statusConfig[status] : severityConfig[severity];
  const label = type === 'status' ? status : severity;
  
  if (!config) return null;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize',
      config.bg, config.text, className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {label?.replace('_', ' ')}
    </span>
  );
}