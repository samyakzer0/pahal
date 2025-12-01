import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  MapPin,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
  Target,
} from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { incidentsApi, hotspotsApi } from '../lib/api'
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns'

const COLORS = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

export default function Analytics() {
  const [timeRange, setTimeRange] = React.useState('7')

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentsApi.getAll(),
  })

  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => hotspotsApi.getAll(),
  })

  // Filter incidents by time range
  const filteredIncidents = incidents.filter((inc) => {
    const incDate = new Date(inc.created_at)
    const startDate = subDays(new Date(), parseInt(timeRange))
    return incDate >= startDate
  })

  // Calculate stats
  const totalIncidents = filteredIncidents.length
  const resolvedIncidents = filteredIncidents.filter((i) => i.status === 'resolved').length
  const resolutionRate = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0
  const criticalIncidents = filteredIncidents.filter((i) => i.severity === 'critical').length

  // Incidents by type
  const typeData = filteredIncidents.reduce((acc, inc) => {
    const type = inc.accident_type || 'unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const typeChartData = Object.entries(typeData).map(([name, value]) => ({
    name: name
      .replace('_', ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    value,
  }))

  // Incidents by severity
  const severityData = filteredIncidents.reduce((acc, inc) => {
    const severity = inc.severity || 'medium'
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const severityChartData = [
    { name: 'Critical', value: severityData['critical'] || 0, color: '#dc2626' },
    { name: 'High', value: severityData['high'] || 0, color: '#f97316' },
    { name: 'Medium', value: severityData['medium'] || 0, color: '#eab308' },
    { name: 'Low', value: severityData['low'] || 0, color: '#22c55e' },
  ]

  // Daily trend data
  const dailyTrend = []
  for (let i = parseInt(timeRange) - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dayStart = startOfDay(date)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const count = filteredIncidents.filter((inc) => {
      const incDate = new Date(inc.created_at)
      return isWithinInterval(incDate, { start: dayStart, end: dayEnd })
    }).length

    dailyTrend.push({
      date: format(date, 'MMM d'),
      incidents: count,
    })
  }

  // Hourly distribution
  const hourlyData = Array(24).fill(0)
  filteredIncidents.forEach((inc) => {
    const hour = new Date(inc.created_at).getHours()
    hourlyData[hour]++
  })

  const hourlyChartData = hourlyData.map((count, hour) => ({
    hour: `${hour}:00`,
    incidents: count,
  }))

  // Top hotspots
  const topHotspots = hotspots.slice(0, 5)

  // Status breakdown
  const statusData = filteredIncidents.reduce((acc, inc) => {
    acc[inc.status] = (acc[inc.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusChartData = [
    { name: 'Reported', value: statusData['reported'] || 0, color: '#dc2626' },
    { name: 'Acknowledged', value: statusData['acknowledged'] || 0, color: '#f97316' },
    { name: 'Dispatched', value: statusData['dispatched'] || 0, color: '#3b82f6' },
    { name: 'En Route', value: statusData['en_route'] || 0, color: '#6366f1' },
    { name: 'On Site', value: statusData['on_site'] || 0, color: '#8b5cf6' },
    { name: 'Resolved', value: statusData['resolved'] || 0, color: '#22c55e' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3"
              >
               
                Analytics Dashboard
              </motion.h1>
              <p className="text-gray-600 mt-1">Incident trends and response metrics</p>
            </div>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48 h-11 rounded-xl">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            title="Total Incidents"
            value={totalIncidents}
            icon={AlertTriangle}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />
          <StatCard
            title="Resolution Rate"
            value={`${resolutionRate}%`}
            icon={TrendingUp}
            trend={resolutionRate > 80 ? 'Above target' : 'Below target'}
            trendUp={resolutionRate > 80}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="Critical Incidents"
            value={criticalIncidents}
            icon={Target}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />
          <StatCard
            title="Avg Response"
            value="4.2 min"
            icon={Clock}
            trend="12% faster"
            trendUp={true}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Incident Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncidents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Severity Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Accident Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Accident Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Hourly Distribution & Top Hotspots */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Hourly Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} interval={2} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Hotspots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Top Hotspots
            </h3>
            <div className="space-y-3">
              {topHotspots.map((hotspot, index) => (
                <motion.div
                  key={hotspot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                      index === 0
                        ? 'bg-red-500'
                        : index === 1
                        ? 'bg-orange-500'
                        : index === 2
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{hotspot.name}</p>
                    <p className="text-sm text-gray-500">{hotspot.accident_count} accidents</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-600">
                      Risk: {hotspot.risk_score}
                    </div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${hotspot.risk_score}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
