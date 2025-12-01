import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, AlertTriangle, TrendingUp, Filter, Search, ChevronRight, X, Clock, Phone, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import HotspotMap from '@/components/map/HotspotMap'
import IncidentCard from '@/components/incident/IncidentCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { dataAPI, Incident } from '@/lib/mockData'
import { format } from 'date-fns'
import { generateDigiPin } from '@/lib/utils'

export default function Hotspots() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => dataAPI.getIncidents(),
  })

  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => dataAPI.getHotspots(),
  })

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false
    if (filterType !== 'all' && inc.accident_type !== filterType) return false
    if (searchQuery && !inc.address?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved')
  const criticalCount = incidents.filter(
    (i) => i.severity === 'critical' && i.status !== 'resolved'
  ).length

  const mapCenter: [number, number] = incidents[0]
    ? [incidents[0].latitude, incidents[0].longitude]
    : [28.6139, 77.209]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3"
              >
                
                Accident Hotspots
              </motion.h1>
              <p className="text-gray-600 mt-1">
                Real-time view of accident-prone zones and active incidents
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">{criticalCount} Critical</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="text-orange-700 font-medium">{activeIncidents.length} Active</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <HotspotMap
              incidents={filteredIncidents}
              hotspots={hotspots}
              onIncidentClick={setSelectedIncident}
              height="600px"
              center={mapCenter}
            />

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 bg-white rounded-xl p-4 border border-gray-100 flex flex-wrap gap-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span className="text-sm text-gray-600">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-sm text-gray-600">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-red-400 bg-red-100/50" />
                <span className="text-sm text-gray-600">Hotspot Zone</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Incident List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Incidents</h3>

                {/* Filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="vehicle_collision">Collision</SelectItem>
                        <SelectItem value="pedestrian_hit">Pedestrian</SelectItem>
                        <SelectItem value="motorcycle_accident">Motorcycle</SelectItem>
                        <SelectItem value="truck_accident">Truck</SelectItem>
                        <SelectItem value="multi_vehicle">Multi-Vehicle</SelectItem>
                        <SelectItem value="hit_and_run">Hit & Run</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Incident List */}
              <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
                {loadingIncidents ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
                    ))}
                  </div>
                ) : filteredIncidents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No incidents found</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredIncidents.map((incident, index) => (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <IncidentCard
                          incident={incident}
                          onClick={() => setSelectedIncident(incident)}
                          compact
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedIncident && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedIncident.title || selectedIncident.accident_type?.replace('_', ' ')}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <StatusBadge status={selectedIncident.status} type="status" />
                      <StatusBadge severity={selectedIncident.severity} type="severity" />
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Photo */}
                {selectedIncident.photo_urls?.[0] && (
                  <div className="rounded-xl overflow-hidden">
                    <img
                      src={selectedIncident.photo_urls[0]}
                      alt="Incident"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-gray-900">{selectedIncident.address}</p>
                    {selectedIncident.latitude && selectedIncident.longitude && (
                      <p className="text-sm text-blue-600 mt-1 font-mono">
                        DigiPin: {generateDigiPin(selectedIncident.latitude, selectedIncident.longitude)}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Reported At</span>
                    </div>
                    <p className="text-gray-900">
                      {format(new Date(selectedIncident.created_date), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                {selectedIncident.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedIncident.description}</p>
                  </div>
                )}

                {selectedIncident.reporter_phone && (
                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Reporter Contact</p>
                      <p className="font-medium text-blue-900">{selectedIncident.reporter_phone}</p>
                    </div>
                  </div>
                )}

                {selectedIncident.report_count > 1 && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-orange-700 font-medium">
                      ⚠️ {selectedIncident.report_count} people have reported this incident
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
