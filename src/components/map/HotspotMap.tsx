// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { AlertTriangle, MapPin, Clock, Navigation } from 'lucide-react'
import { format } from 'date-fns'
import L from 'leaflet'
import type { Incident, Hotspot } from '../../lib/database.types'
import StatusBadge from '../ui/StatusBadge'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const severityColors: Record<string, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

const createCustomIcon = (severity: string) => {
  const color = severityColors[severity] || severityColors.medium
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
        ${severity === 'critical' ? 'animation: marker-pulse 1.5s infinite;' : ''}
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" stroke-width="2" fill="none"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

interface MapControllerProps {
  center: [number, number]
}

function MapController({ center }: MapControllerProps) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 13)
    }
  }, [center, map])
  return null
}

interface HotspotMapProps {
  incidents?: Incident[]
  hotspots?: Hotspot[]
  onIncidentClick?: (incident: Incident) => void
  center?: [number, number]
  height?: string
  showHotspots?: boolean
}

export default function HotspotMap({
  incidents = [],
  hotspots = [],
  onIncidentClick,
  center = [28.6139, 77.209],
  height = '400px',
  showHotspots = true,
}: HotspotMapProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      <style>{`
        @keyframes marker-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
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

        {showHotspots &&
          hotspots.map((hotspot) => (
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
                <div className="p-2 min-w-[200px]">
                  <h4 className="font-semibold text-gray-900 mb-2">{hotspot.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Risk Score: <span className="font-medium text-red-600">{hotspot.risk_score}</span></p>
                    <p>Total Accidents: {hotspot.accident_count}</p>
                  </div>
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
              <div className="p-2 min-w-[250px]">
                <div className="flex items-start gap-3 mb-3">
                  {incident.media_urls?.[0] && (
                    <img
                      src={incident.media_urls[0]}
                      alt="Incident"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      {incident.title || incident.accident_type?.replace('_', ' ')}
                    </h4>
                    <div className="flex gap-1">
                      <StatusBadge severity={incident.severity} type="severity" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{incident.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(incident.created_at), 'MMM d, h:mm a')}</span>
                  </div>

                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Attribution Overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-600" />
          <span>
            {incidents.length} Active Incidents | {hotspots.length} Hotspots
          </span>
        </div>
      </div>
    </div>
  )
}
