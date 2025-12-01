import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertTriangle, Clock, CheckCircle2, TrendingUp, 
  MapPin, Filter, RefreshCw, Bell, Users, Activity,
  Ambulance, ChevronRight, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInMinutes } from 'date-fns';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import IncidentCard from '@/components/incident/IncidentCard';
import HotspotMap from '@/components/map/HotspotMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [responseNotes, setResponseNotes] = useState('');

  const { data: incidents = [], isLoading, refetch } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-created_date', 100),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => base44.entities.Hotspot.list('-risk_score', 50),
  });

  const { data: responders = [] } = useQuery({
    queryKey: ['responders'],
    queryFn: () => base44.entities.Responder.list(),
  });

  const updateIncidentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Incident.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setSelectedIncident(null);
      setResponseNotes('');
    },
  });

  const filteredIncidents = incidents.filter(inc => {
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
    return true;
  });

  // Stats calculation
  const stats = {
    total: incidents.length,
    pending: incidents.filter(i => i.status === 'reported').length,
    inProgress: incidents.filter(i => ['acknowledged', 'dispatched', 'en_route', 'on_site'].includes(i.status)).length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    critical: incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length,
    avgResponseTime: '4.2 min',
  };

  const handleStatusUpdate = (newStatus) => {
    if (!selectedIncident) return;
    
    const updateData = { 
      status: newStatus,
      response_notes: responseNotes || selectedIncident.response_notes,
    };
    
    if (newStatus === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }
    
    updateIncidentMutation.mutate({ 
      id: selectedIncident.id, 
      data: updateData 
    });
  };

  const handlePriorityUpdate = (newSeverity) => {
    if (!selectedIncident) return;
    updateIncidentMutation.mutate({
      id: selectedIncident.id,
      data: { severity: newSeverity }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
              <p className="text-sm text-gray-500">Emergency Response Dashboard</p>
            </div>
            
            <div className="flex items-center gap-3">
              {stats.critical > 0 && (
                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl animate-pulse">
                  <Bell className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-700">{stats.critical} Critical Alerts</span>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => refetch()}
                className="rounded-xl"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Pending Response"
            value={stats.pending}
            icon={AlertTriangle}
            className="border-l-4 border-l-red-500"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={Activity}
            className="border-l-4 border-l-blue-500"
          />
          <StatCard
            title="Resolved Today"
            value={stats.resolved}
            icon={CheckCircle2}
            className="border-l-4 border-l-green-500"
          />
          <StatCard
            title="Avg Response Time"
            value={stats.avgResponseTime}
            icon={Clock}
            className="border-l-4 border-l-purple-500"
          />
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="bg-white border rounded-xl p-1">
            <TabsTrigger value="feed" className="rounded-lg">Live Feed</TabsTrigger>
            <TabsTrigger value="map" className="rounded-lg">Map View</TabsTrigger>
            <TabsTrigger value="responders" className="rounded-lg">Responders</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 h-9 rounded-lg">
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
                <SelectTrigger className="w-40 h-9 rounded-lg">
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
              
              <span className="text-sm text-gray-500">
                Showing {filteredIncidents.length} incidents
              </span>
            </div>

            {/* Incident Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
                  ))
                ) : filteredIncidents.length === 0 ? (
                  <div className="col-span-full text-center py-16 text-gray-500">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No incidents matching filters</p>
                  </div>
                ) : (
                  filteredIncidents.map((incident) => (
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
            <HotspotMap
              incidents={filteredIncidents}
              hotspots={hotspots}
              onIncidentClick={setSelectedIncident}
              height="600px"
              center={incidents[0] ? [incidents[0].latitude, incidents[0].longitude] : [28.6139, 77.2090]}
            />
          </TabsContent>

          <TabsContent value="responders">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {responders.length === 0 ? (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No responders registered</p>
                </div>
              ) : (
                responders.map((responder) => (
                  <div 
                    key={responder.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          responder.type === 'ambulance' ? 'bg-red-100' :
                          responder.type === 'fire' ? 'bg-orange-100' :
                          responder.type === 'police' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Ambulance className={`w-6 h-6 ${
                            responder.type === 'ambulance' ? 'text-red-600' :
                            responder.type === 'fire' ? 'text-orange-600' :
                            responder.type === 'police' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{responder.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{responder.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        responder.is_available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {responder.is_available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{responder.phone}</span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                      <span className="text-gray-500">Responses: {responder.total_responses || 0}</span>
                      <span className="text-gray-500">Avg: {responder.avg_response_time_mins || '-'} min</span>
                    </div>
                  </div>
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
              {/* Photo */}
              {selectedIncident.photo_urls?.[0] && (
                <img
                  src={selectedIncident.photo_urls[0]}
                  alt="Incident"
                  className="w-full h-56 object-cover rounded-xl"
                />
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
                  <p className="font-medium">{format(new Date(selectedIncident.created_date), 'PPpp')}</p>
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
                      className={`capitalize rounded-lg ${
                        sev === 'critical' ? 'bg-red-600 hover:bg-red-700' :
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
                  value={responseNotes || selectedIncident.response_notes || ''}
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