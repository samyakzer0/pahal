import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, Clock, MapPin, 
  Activity, Calendar, ArrowUp, ArrowDown
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';

const COLORS = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

export default function Analytics() {
  const [timeRange, setTimeRange] = React.useState('7');

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-created_date', 500),
  });

  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => base44.entities.Hotspot.list('-risk_score', 50),
  });

  // Filter incidents by time range
  const filteredIncidents = incidents.filter(inc => {
    const incDate = new Date(inc.created_date);
    const startDate = subDays(new Date(), parseInt(timeRange));
    return incDate >= startDate;
  });

  // Calculate stats
  const totalIncidents = filteredIncidents.length;
  const resolvedIncidents = filteredIncidents.filter(i => i.status === 'resolved').length;
  const resolutionRate = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0;
  const criticalIncidents = filteredIncidents.filter(i => i.severity === 'critical').length;

  // Incidents by type
  const typeData = filteredIncidents.reduce((acc, inc) => {
    const type = inc.accident_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(typeData).map(([name, value]) => ({
    name: name.replace('_', ' ').charAt(0).toUpperCase() + name.replace('_', ' ').slice(1),
    value,
  }));

  // Incidents by severity
  const severityData = filteredIncidents.reduce((acc, inc) => {
    const severity = inc.severity || 'medium';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const severityChartData = [
    { name: 'Critical', value: severityData.critical || 0, color: '#dc2626' },
    { name: 'High', value: severityData.high || 0, color: '#f97316' },
    { name: 'Medium', value: severityData.medium || 0, color: '#eab308' },
    { name: 'Low', value: severityData.low || 0, color: '#22c55e' },
  ];

  // Daily trend data
  const dailyTrend = [];
  for (let i = parseInt(timeRange) - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    
    const count = filteredIncidents.filter(inc => {
      const incDate = new Date(inc.created_date);
      return isWithinInterval(incDate, { start: dayStart, end: dayEnd });
    }).length;
    
    dailyTrend.push({
      date: format(date, 'MMM d'),
      incidents: count,
    });
  }

  // Hourly distribution
  const hourlyData = Array(24).fill(0);
  filteredIncidents.forEach(inc => {
    const hour = new Date(inc.created_date).getHours();
    hourlyData[hour]++;
  });

  const hourlyChartData = hourlyData.map((count, hour) => ({
    hour: `${hour}:00`,
    incidents: count,
  }));

  // Top hotspots
  const topHotspots = hotspots.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                Analytics Dashboard
              </h1>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Incidents"
            value={totalIncidents}
            icon={AlertTriangle}
          />
          <StatCard
            title="Resolution Rate"
            value={`${resolutionRate}%`}
            icon={TrendingUp}
            trend={resolutionRate > 80 ? 'Above target' : 'Below target'}
            trendUp={resolutionRate > 80}
          />
          <StatCard
            title="Critical Incidents"
            value={criticalIncidents}
            icon={AlertTriangle}
            className="border-l-4 border-l-red-500"
          />
          <StatCard
            title="Hotspots Identified"
            value={hotspots.length}
            icon={MapPin}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Trend */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Incident Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Severity Distribution</h3>
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Incidents by Type */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Incidents by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  stroke="#9ca3af"
                  width={100}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Hourly Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10 }} 
                  stroke="#9ca3af"
                  interval={3}
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="incidents" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Hotspots */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Risk Zones</h3>
          <div className="space-y-4">
            {topHotspots.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hotspots data available</p>
            ) : (
              topHotspots.map((hotspot, index) => (
                <div 
                  key={hotspot.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-red-500' :
                      index === 1 ? 'bg-orange-500' :
                      index === 2 ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{hotspot.name}</p>
                      <p className="text-sm text-gray-500">{hotspot.accident_count || 0} incidents recorded</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Risk: {hotspot.risk_score || 'N/A'}</p>
                    <p className="text-sm text-gray-500">
                      {hotspot.last_incident_date 
                        ? `Last: ${format(new Date(hotspot.last_incident_date), 'MMM d')}`
                        : 'No recent incidents'
                      }
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}