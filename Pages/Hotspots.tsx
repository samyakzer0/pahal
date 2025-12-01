import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, AlertTriangle, TrendingUp, Filter, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import HotspotMap from '@/components/map/HotspotMap';
import IncidentCard from '@/components/incident/IncidentCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { format } from 'date-fns';

export default function Hotspots() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-created_date', 100),
  });

  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => base44.entities.Hotspot.list('-risk_score', 50),
  });

  const filteredIncidents = incidents.filter(inc => {
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
    if (filterType !== 'all' && inc.accident_type !== filterType) return false;
    if (searchQuery && !inc.address?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                Accident Hotspots
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time view of accident-prone zones and active incidents
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">{criticalCount} Critical</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="text-orange-700 font-medium">{activeIncidents.length} Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <HotspotMap
              incidents={filteredIncidents}
              hotspots={hotspots}
              onIncidentClick={setSelectedIncident}
              height="600px"
              center={incidents[0] ? [incidents[0].latitude, incidents[0].longitude] : [28.6139, 77.2090]}
            />
            
            {/* Legend */}
            <div className="mt-4 bg-white rounded-xl p-4 border border-gray-100 flex flex-wrap gap-6">
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
            </div>
          </div>

          {/* Incident List */}
          <div className="lg:col-span-1">
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
                      className="pl-10 h-10 rounded-xl"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                      <SelectTrigger className="h-10 rounded-xl">
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
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="vehicle_collision">Collision</SelectItem>
                        <SelectItem value="pedestrian_hit">Pedestrian</SelectItem>
                        <SelectItem value="motorcycle_accident">Motorcycle</SelectItem>
                        <SelectItem value="truck_accident">Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {loadingIncidents ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
                    ))
                  ) : filteredIncidents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No incidents found</p>
                    </div>
                  ) : (
                    filteredIncidents.slice(0, 20).map((incident) => (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <IncidentCard
                          incident={incident}
                          onClick={() => setSelectedIncident(incident)}
                          compact
                        />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Incident Details</DialogTitle>
          </DialogHeader>
          
          {selectedIncident && (
            <div className="space-y-6">
              {selectedIncident.photo_urls?.[0] && (
                <img
                  src={selectedIncident.photo_urls[0]}
                  alt="Incident"
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}
              
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedIncident.status} type="status" />
                <StatusBadge severity={selectedIncident.severity} type="severity" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedIncident.accident_type?.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium">{selectedIncident.address || 'Unknown'}</p>
                  {selectedIncident.digipin && (
                    <p className="text-sm text-blue-600">DigiPin: {selectedIncident.digipin}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reported</p>
                  <p className="font-medium">{format(new Date(selectedIncident.created_date), 'PPpp')}</p>
                </div>
                
                {selectedIncident.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{selectedIncident.description}</p>
                  </div>
                )}
                
                {selectedIncident.report_count > 1 && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-orange-700 font-medium">
                      {selectedIncident.report_count} people have reported this incident
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}