// Mock data store for the Pahal application
// In production, this would be replaced with actual API calls

export interface Incident {
  id: string
  title: string
  description: string
  accident_type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'reported' | 'acknowledged' | 'dispatched' | 'en_route' | 'on_site' | 'resolved'
  latitude: number
  longitude: number
  address: string
  photo_urls: string[]
  reporter_name?: string
  reporter_phone?: string
  created_date: string
  updated_date: string
  resolved_at?: string
  response_notes?: string
  report_count: number

  is_ai_detected?: boolean
}

export interface Hotspot {
  id: string
  name: string
  latitude: number
  longitude: number
  radius_meters: number
  accident_count: number
  risk_score: number
  last_incident_date: string
  common_accident_types: string[]
}

export interface Responder {
  id: string
  name: string
  type: 'ambulance' | 'fire' | 'police' | 'traffic'
  phone: string
  email: string
  is_available: boolean
  current_location_lat: number
  current_location_lng: number
  assigned_incident_id?: string
  total_responses: number
  avg_response_time_mins: number
}

// Mock incidents data
export const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Multi-vehicle collision on NH-44',
    description: 'Three vehicles involved in a collision near the toll plaza. Traffic is affected.',
    accident_type: 'multi_vehicle',
    severity: 'critical',
    status: 'dispatched',
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'NH-44, Near Kashmere Gate, Delhi',
    photo_urls: ['https://images.unsplash.com/photo-1562823091-7a6c1f520c36?w=400'],
    reporter_name: 'Rahul Sharma',
    reporter_phone: '+91 98765 43210',
    created_date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_date: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    report_count: 3,

  },
  {
    id: '2',
    title: 'Motorcycle accident near metro station',
    description: 'Motorcycle skidded and fell. Rider has minor injuries.',
    accident_type: 'motorcycle_accident',
    severity: 'medium',
    status: 'acknowledged',
    latitude: 28.6280,
    longitude: 77.2189,
    address: 'Near Rajiv Chowk Metro Station, Delhi',
    photo_urls: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    created_date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    report_count: 1,

  },
  {
    id: '3',
    title: 'Pedestrian hit by speeding car',
    description: 'Pedestrian was crossing the road when hit by a speeding vehicle.',
    accident_type: 'pedestrian_hit',
    severity: 'high',
    status: 'en_route',
    latitude: 28.5494,
    longitude: 77.2513,
    address: 'Nehru Place Flyover, Delhi',
    photo_urls: ['https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=400'],
    reporter_name: 'Priya Patel',
    reporter_phone: '+91 87654 32109',
    created_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_date: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    report_count: 2,

  },
  {
    id: '4',
    title: 'Truck-car collision on Ring Road',
    description: 'Heavy truck rear-ended a car. Major damage to car, occupants injured.',
    accident_type: 'truck_accident',
    severity: 'critical',
    status: 'on_site',
    latitude: 28.5672,
    longitude: 77.2100,
    address: 'Outer Ring Road, Saket, Delhi',
    photo_urls: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400'],
    created_date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updated_date: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    report_count: 4,

  },
  {
    id: '5',
    title: 'Hit and run near school zone',
    description: 'Vehicle hit a cyclist and fled the scene. Cyclist has moderate injuries.',
    accident_type: 'hit_and_run',
    severity: 'high',
    status: 'reported',
    latitude: 28.6350,
    longitude: 77.2245,
    address: 'Civil Lines, Near DPS School, Delhi',
    photo_urls: [],
    created_date: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updated_date: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    report_count: 1,

  },
  {
    id: '6',
    title: 'Minor fender bender at traffic signal',
    description: 'Two cars had a minor collision at the signal. No injuries reported.',
    accident_type: 'vehicle_collision',
    severity: 'low',
    status: 'resolved',
    latitude: 28.5921,
    longitude: 77.2290,
    address: 'Lodhi Road Signal, Delhi',
    photo_urls: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400'],
    created_date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_date: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    resolved_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    report_count: 1,

  },
]

// Mock hotspots data
export const mockHotspots: Hotspot[] = [
  {
    id: '1',
    name: 'Kashmere Gate Junction',
    latitude: 28.6139,
    longitude: 77.2090,
    radius_meters: 600,
    accident_count: 47,
    risk_score: 85,
    last_incident_date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    common_accident_types: ['multi_vehicle', 'motorcycle_accident'],
  },
  {
    id: '2',
    name: 'Nehru Place Flyover',
    latitude: 28.5494,
    longitude: 77.2513,
    radius_meters: 500,
    accident_count: 38,
    risk_score: 72,
    last_incident_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    common_accident_types: ['pedestrian_hit', 'vehicle_collision'],
  },
  {
    id: '3',
    name: 'Outer Ring Road Saket',
    latitude: 28.5672,
    longitude: 77.2100,
    radius_meters: 700,
    accident_count: 52,
    risk_score: 88,
    last_incident_date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    common_accident_types: ['truck_accident', 'multi_vehicle'],
  },
  {
    id: '4',
    name: 'Rajiv Chowk',
    latitude: 28.6280,
    longitude: 77.2189,
    radius_meters: 400,
    accident_count: 29,
    risk_score: 65,
    last_incident_date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    common_accident_types: ['motorcycle_accident', 'hit_and_run'],
  },
  {
    id: '5',
    name: 'ITO Junction',
    latitude: 28.6289,
    longitude: 77.2408,
    radius_meters: 550,
    accident_count: 44,
    risk_score: 78,
    last_incident_date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    common_accident_types: ['vehicle_collision', 'pedestrian_hit'],
  },
]

// Mock responders data
export const mockResponders: Responder[] = [
  {
    id: '1',
    name: 'Ambulance Unit A-101',
    type: 'ambulance',
    phone: '+91 102',
    email: 'ambulance.a101@pahal.gov.in',
    is_available: false,
    current_location_lat: 28.6100,
    current_location_lng: 77.2050,
    assigned_incident_id: '1',
    total_responses: 234,
    avg_response_time_mins: 4.2,
  },
  {
    id: '2',
    name: 'Fire Unit F-205',
    type: 'fire',
    phone: '+91 101',
    email: 'fire.f205@pahal.gov.in',
    is_available: true,
    current_location_lat: 28.5800,
    current_location_lng: 77.2200,
    total_responses: 156,
    avg_response_time_mins: 5.1,
  },
  {
    id: '3',
    name: 'Police Patrol P-312',
    type: 'police',
    phone: '+91 100',
    email: 'police.p312@pahal.gov.in',
    is_available: false,
    current_location_lat: 28.5650,
    current_location_lng: 77.2150,
    assigned_incident_id: '4',
    total_responses: 312,
    avg_response_time_mins: 3.8,
  },
  {
    id: '4',
    name: 'Traffic Unit T-110',
    type: 'traffic',
    phone: '+91 1095',
    email: 'traffic.t110@pahal.gov.in',
    is_available: true,
    current_location_lat: 28.6300,
    current_location_lng: 77.2300,
    total_responses: 428,
    avg_response_time_mins: 6.5,
  },
  {
    id: '5',
    name: 'Ambulance Unit A-102',
    type: 'ambulance',
    phone: '+91 102',
    email: 'ambulance.a102@pahal.gov.in',
    is_available: true,
    current_location_lat: 28.5500,
    current_location_lng: 77.2600,
    total_responses: 189,
    avg_response_time_mins: 4.8,
  },
]

// Data API simulation
class MockDataAPI {
  private incidents: Incident[] = [...mockIncidents]
  private hotspots: Hotspot[] = [...mockHotspots]
  private responders: Responder[] = [...mockResponders]

  // Incidents
  async getIncidents(): Promise<Incident[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.incidents]), 300)
    })
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.incidents.find((i) => i.id === id)), 200)
    })
  }

  async createIncident(incident: Omit<Incident, 'id' | 'created_date' | 'updated_date' | 'report_count'>): Promise<Incident> {
    return new Promise((resolve) => {
      const newIncident: Incident = {
        ...incident,
        id: String(Date.now()),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        report_count: 1,
      }
      this.incidents.unshift(newIncident)
      setTimeout(() => resolve(newIncident), 500)
    })
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined> {
    return new Promise((resolve) => {
      const index = this.incidents.findIndex((i) => i.id === id)
      if (index > -1) {
        this.incidents[index] = {
          ...this.incidents[index],
          ...updates,
          updated_date: new Date().toISOString(),
        }
        setTimeout(() => resolve(this.incidents[index]), 300)
      } else {
        resolve(undefined)
      }
    })
  }

  // Hotspots
  async getHotspots(): Promise<Hotspot[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.hotspots]), 300)
    })
  }

  // Responders
  async getResponders(): Promise<Responder[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.responders]), 300)
    })
  }

  async updateResponder(id: string, updates: Partial<Responder>): Promise<Responder | undefined> {
    return new Promise((resolve) => {
      const index = this.responders.findIndex((r) => r.id === id)
      if (index > -1) {
        this.responders[index] = { ...this.responders[index], ...updates }
        setTimeout(() => resolve(this.responders[index]), 300)
      } else {
        resolve(undefined)
      }
    })
  }
}

export const dataAPI = new MockDataAPI()
