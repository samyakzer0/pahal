import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const severityColors = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const createCustomIcon = (severity) => {
  const color = severityColors[severity] || severityColors.medium;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        ${severity === 'critical' ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" stroke-width="2" fill="none"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function HotspotMap({ 
  incidents = [], 
  hotspots = [], 
  onIncidentClick, 
  center = [28.6139, 77.2090],
  height = '400px',
  showHotspots = true 
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
      
      <MapContainer
        center={center}
        zoom={12}
        style={{ height, width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} />
        
        {showHotspots && hotspots.map((hotspot) => (
          <Circle
            key={hotspot.id}
            center={[hotspot.latitude, hotspot.longitude]}
            radius={hotspot.radius_meters || 500}
            pathOptions={{
              color: '#dc2626',
              fillColor: '#dc2626',
              fillOpacity: 0.15 + (hotspot.risk_score || 50) / 200,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold text-gray-900">{hotspot.name}</h4>
                <p className="text-sm text-gray-600">
                  Risk Score: {hotspot.risk_score || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Incidents: {hotspot.accident_count || 0}
                </p>
              </div>
            </Popup>
          </Circle>
        ))}
        
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.latitude, incident.longitude]}
            icon={createCustomIcon(incident.severity)}
            eventHandlers={{
              click: () => onIncidentClick?.(incident),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {incident.title || incident.accident_type?.replace('_', ' ')}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{incident.address || 'Unknown location'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(incident.created_date), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onIncidentClick?.(incident)}
                  className="mt-3 w-full bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}