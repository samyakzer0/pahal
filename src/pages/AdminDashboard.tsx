// @ts-nocheck
// Verified write access

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle, Clock, CheckCircle2, TrendingUp,
  MapPin, Filter, RefreshCw, Bell, Users, Activity,
  Siren, ChevronRight, Phone, Navigation, Shield, Flame, Car, Truck,
  Search, SlidersHorizontal
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInMinutes } from 'date-fns';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import IncidentCard from '../components/incident/IncidentCard';
import HotspotMap from '../components/map/HotspotMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { incidentsApi, respondersApi, hotspotsApi, incidentMediaApi } from '../lib/api';
import type { Incident } from '../lib/database.types';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [responseNotes, setResponseNotes] = useState('');

  const { data: incidents = [], isLoading, refetch } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentsApi.getAll(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => hotspotsApi.getAll(),
  });

  const { data: responders = [] } = useQuery({
    queryKey: ['responders'],
    queryFn: () => respondersApi.getAll(),
  });

  // Fetch media for selected incident
  const { data: incidentMedia = [] } = useQuery({
    queryKey: ['incident-media', selectedIncident?.id],
    queryFn: () => selectedIncident ? incidentMediaApi.getByIncidentId(selectedIncident.id) : Promise.resolve([]),
    enabled: !!selectedIncident,
  });

  const updateIncidentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => incidentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setSelectedIncident(null);
      setResponseNotes('');
    },
  });

  const filteredIncidents = incidents.filter((inc: Incident) => {
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
    return true;
  });

  // Stats calculation
  const stats = {
    total: incidents.length,
    pending: incidents.filter((i: Incident) => i.status === 'reported').length,
    inProgress: incidents.filter((i: Incident) => ['acknowledged', 'dispatched', 'en_route', 'on_site'].includes(i.status)).length,
    resolved: incidents.filter((i: Incident) => i.status === 'resolved').length,
    critical: incidents.filter((i: Incident) => i.severity === 'critical' && i.status !== 'resolved').length,
    avgResponseTime: '4.2 min',
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (!selectedIncident) return;

    const updateData: any = {
      status: newStatus,
      resolution_notes: responseNotes || selectedIncident.resolution_notes,
    };

    if (newStatus === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    updateIncidentMutation.mutate({
      id: selectedIncident.id,
      data: updateData
    });
  };

  const handlePriorityUpdate = (newSeverity: string) => {
    if (!selectedIncident) return;
    updateIncidentMutation.mutate({
      id: selectedIncident.id,
      data: { severity: newSeverity }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      {/* Professional Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Command Center</h1>
              <p className="text-sm text-gray-600 mt-0.5">Real-time Emergency Operations</p>
            </div>

            <div className="flex items-center gap-3">
              {stats.critical > 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200/50 px-4 py-2.5 rounded-xl"
                >
                  <div className="relative">
                    <Bell className="w-5 h-5 text-red-600" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-red-700">{stats.critical} Critical</span>
                    <p className="text-xs text-red-600/80">Requires attention</p>
                  </div>
                </motion.div>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                className="rounded-xl border-gray-200 hover:bg-gray-50 h-11 w-11"
                title="Refresh data"
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-600" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Response</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
                  <p className="text-xs text-gray-500 mt-1">Active responses</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-green-600" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Resolved Today</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
                  <p className="text-xs text-gray-500 mt-1">Successfully closed</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-600" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg Response Time</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.avgResponseTime}</p>
                  <p className="text-xs text-gray-500 mt-1">System performance</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
            <TabsList className="bg-transparent w-full grid grid-cols-3 gap-2">
              <TabsTrigger
                value="feed"
                className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/25 transition-all"
              >
                Live Feed
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/25 transition-all"
              >
                Map View
              </TabsTrigger>
              <TabsTrigger
                value="responders"
                className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/25 transition-all"
              >
                Responders
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="feed" className="space-y-5">
            {/* Refined Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <SlidersHorizontal className="w-4.5 h-4.5 text-gray-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Filter by:</span>
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px] h-10 rounded-xl border-gray-200 bg-gray-50/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="en_route">En Route</SelectItem>
                    <SelectItem value="on_site">On Site</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-[160px] h-10 rounded-xl border-gray-200 bg-gray-50/50">
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

                <div className="flex-1" />

                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-sm font-medium text-gray-700">
                    {filteredIncidents.length} {filteredIncidents.length === 1 ? 'incident' : 'incidents'}
                  </span>
                </div>
              </div>
            </div>

            {/* Incident Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl h-56 animate-pulse border border-gray-100" />
                  ))
                ) : filteredIncidents.length === 0 ? (
                  <div className="col-span-full">
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No incidents found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your filters</p>
                    </div>
                  </div>
                ) : (
                  filteredIncidents.map((incident: Incident) => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <IncidentCard
                        incident={incident}
                        onClick={() => setSelectedIncident(incident)}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <HotspotMap
                incidents={filteredIncidents}
                hotspots={hotspots}
                onIncidentClick={setSelectedIncident}
                height="600px"
                center={incidents[0] ? [incidents[0].latitude, incidents[0].longitude] : [28.6139, 77.2090]}
              />
            </div>
          </TabsContent>

          <TabsContent value="responders">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {responders.length === 0 ? (
                <div className="col-span-full">
                  <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No responders registered</h3>
                    <p className="text-sm text-gray-500">Responders will appear here once registered</p>
                  </div>
                </div>
              ) : (
                responders.map((responder: any) => (
                  <motion.div
                    key={responder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${responder.type === 'ambulance' ? 'bg-gradient-to-br from-red-50 to-red-100/50' :
                          responder.type === 'fire' ? 'bg-gradient-to-br from-orange-50 to-orange-100/50' :
                            responder.type === 'police' ? 'bg-gradient-to-br from-blue-50 to-blue-100/50' :
                              'bg-gradient-to-br from-gray-50 to-gray-100/50'
                          }`}>
                          <Truck className={`w-7 h-7 ${responder.type === 'ambulance' ? 'text-red-600' :
                            responder.type === 'fire' ? 'text-orange-600' :
                              responder.type === 'police' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">{responder.name}</h3>
                          <p className="text-sm text-gray-500 capitalize mt-0.5">{responder.type}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${responder.is_available
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                        {responder.is_available ? 'Available' : 'Busy'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm text-gray-600 mb-5 pb-5 border-b border-gray-100">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${responder.phone}`} className="hover:text-blue-600 transition-colors">
                        {responder.phone}
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Responses</p>
                        <p className="text-lg font-bold text-gray-900">{responder.total_responses || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Avg Time</p>
                        <p className="text-lg font-bold text-gray-900">{responder.avg_response_time_mins || '-'} min</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Incident Detail Modal */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Incident Management</DialogTitle>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-6">
              {/* Photos */}
              {incidentMedia.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {incidentMedia.slice(0, 4).map((media) => (
                      <img
                        key={media.id}
                        src={media.file_url}
                        alt="Incident evidence"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        loading="lazy"
                      />
                    ))}
                  </div>
                  {incidentMedia.length > 4 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{incidentMedia.length - 4} more photos
                    </p>
                  )}
                </div>
              )}

              {/* Status & Severity */}
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedIncident.status} type="status" />
                <StatusBadge severity={selectedIncident.severity} type="severity" />
                {selectedIncident.is_ai_detected && (
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    AI Detected
                  </span>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedIncident.accident_type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reported</p>
                  <p className="font-medium">{format(new Date(selectedIncident.created_at), 'PPpp')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium">{selectedIncident.address || 'Unknown location'}</p>
                  {selectedIncident.digipin && (
                    <p className="text-sm text-blue-600 mt-1">DigiPin: {selectedIncident.digipin}</p>
                  )}
                </div>

                {selectedIncident.reporter_phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Reporter Contact</p>
                    <a href={`tel:${selectedIncident.reporter_phone}`} className="font-medium text-blue-600">
                      {selectedIncident.reporter_phone}
                    </a>
                  </div>
                )}

                {selectedIncident.report_count > 1 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Report Count</p>
                    <p className="font-medium text-orange-600">{selectedIncident.report_count} reports</p>
                  </div>
                )}
              </div>

              {selectedIncident.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{selectedIncident.description}</p>
                </div>
              )}

              {/* Priority Reassignment */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Change Priority</Label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'critical'].map((sev) => (
                    <Button
                      key={sev}
                      size="sm"
                      variant={selectedIncident.severity === sev ? 'default' : 'outline'}
                      onClick={() => handlePriorityUpdate(sev)}
                      className={`capitalize rounded-lg ${sev === 'critical' ? 'bg-red-600 hover:bg-red-700' :
                        sev === 'high' ? 'bg-orange-500 hover:bg-orange-600' :
                          sev === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                            'bg-green-500 hover:bg-green-600'
                        } ${selectedIncident.severity === sev ? 'text-white' : ''}`}
                    >
                      {sev}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Response Notes */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Response Notes</Label>
                <Textarea
                  value={responseNotes || selectedIncident.resolution_notes || ''}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Add notes about the response..."
                  className="min-h-[80px] rounded-xl"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedIncident(null)}
              className="rounded-xl"
            >
              Close
            </Button>

            {selectedIncident?.status === 'reported' && (
              <Button
                onClick={() => handleStatusUpdate('acknowledged')}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                Acknowledge
              </Button>
            )}

            {selectedIncident?.status === 'acknowledged' && (
              <Button
                onClick={() => handleStatusUpdate('dispatched')}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
              >
                Dispatch Responder
              </Button>
            )}

            {selectedIncident?.status === 'dispatched' && (
              <Button
                onClick={() => handleStatusUpdate('en_route')}
                className="rounded-xl bg-purple-600 hover:bg-purple-700"
              >
                Mark En Route
              </Button>
            )}

            {selectedIncident?.status === 'en_route' && (
              <Button
                onClick={() => handleStatusUpdate('on_site')}
                className="rounded-xl bg-orange-600 hover:bg-orange-700"
              >
                Arrived On Site
              </Button>
            )}

            {selectedIncident?.status === 'on_site' && (
              <Button
                onClick={() => handleStatusUpdate('resolved')}
                className="rounded-xl bg-green-600 hover:bg-green-700"
              >
                Mark Resolved
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}