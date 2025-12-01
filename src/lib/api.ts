// @ts-nocheck
/**
 * Database API Service
 * Provides typed functions for interacting with Supabase database
 * Type checking disabled pending database type generation
 */

import { supabase, uploadIncidentMedia, uploadCameraCapture } from './supabase'
import type {
  Incident,
  IncidentInsert,
  IncidentUpdate,
  Responder,
  Hotspot,
  User,
  SmartCamera,
  CameraCapture,
  CameraCaptureInsert,
  Notification,
  IncidentMedia,
  IncidentMediaInsert,
  AccidentType,
  SeverityLevel,
  IncidentStatus,
  ResponderType,
} from './database.types'

// =============================================
// INCIDENTS API
// =============================================

export const incidentsApi = {
  // Get all incidents with optional filters
  async getAll(filters?: {
    status?: IncidentStatus
    severity?: SeverityLevel
    limit?: number
    offset?: number
  }): Promise<Incident[]> {
    let query = supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Get single incident by ID
  async getById(id: string): Promise<Incident | null> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Get incidents near a location
  async getNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<Incident[]> {
    // Use PostGIS for geo queries
    const { data, error } = await (supabase.rpc as any)('find_nearby_incidents', {
      p_latitude: latitude,
      p_longitude: longitude,
      p_radius_km: radiusKm,
    })

    if (error) {
      // Fallback to simple query if RPC not available
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (fallbackError) throw fallbackError
      return fallbackData || []
    }

    return data || []
  },

  // Create new incident
  async create(incident: IncidentInsert): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .insert(incident as any)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update incident
  async update(id: string, updates: IncidentUpdate): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update incident status
  async updateStatus(
    id: string,
    status: IncidentStatus,
    userId?: string
  ): Promise<Incident> {
    const updates: IncidentUpdate = { status }

    // Add timestamp based on status
    switch (status) {
      case 'acknowledged':
        updates.acknowledged_at = new Date().toISOString()
        updates.acknowledged_by = userId
        break
      case 'dispatched':
        updates.dispatched_at = new Date().toISOString()
        break
      case 'resolved':
        updates.resolved_at = new Date().toISOString()
        updates.resolved_by = userId
        break
    }

    return this.update(id, updates)
  },

  // Get incident statistics
  async getStats(): Promise<{
    total: number
    pending: number
    inProgress: number
    resolved: number
    critical: number
  }> {
    const { data, error } = await supabase
      .from('incidents')
      .select('status, severity')

    if (error) throw error

    const incidents = data || []
    return {
      total: incidents.length,
      pending: incidents.filter((i: any) => i.status === 'reported').length,
      inProgress: incidents.filter(
        (i: any) => ['acknowledged', 'dispatched', 'en_route', 'on_site'].includes(i.status)
      ).length,
      resolved: incidents.filter((i: any) => i.status === 'resolved').length,
      critical: incidents.filter(
        (i: any) => i.severity === 'critical' && i.status !== 'resolved'
      ).length,
    }
  },
}

// =============================================
// INCIDENT MEDIA API
// =============================================

export const incidentMediaApi = {
  // Get media for incident
  async getByIncidentId(incidentId: string): Promise<IncidentMedia[]> {
    const { data, error } = await supabase
      .from('incident_media')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Upload and create media record
  async upload(
    incidentId: string,
    file: File,
    isPrimary: boolean = false
  ): Promise<IncidentMedia | null> {
    const uploadResult = await uploadIncidentMedia(incidentId, file)
    if (!uploadResult) return null

    const mediaRecord: IncidentMediaInsert = {
      incident_id: incidentId,
      file_name: file.name,
      file_path: uploadResult.path,
      file_url: uploadResult.url,
      file_type: file.type,
      file_size: file.size,
      is_primary: isPrimary,
      source: 'citizen_app',
    }

    const { data, error } = await supabase
      .from('incident_media')
      .insert(mediaRecord as any)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// =============================================
// RESPONDERS API
// =============================================

export const respondersApi = {
  // Get all responders
  async getAll(filters?: {
    type?: ResponderType
    isAvailable?: boolean
  }): Promise<Responder[]> {
    let query = supabase
      .from('responders')
      .select('*')
      .order('name')

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.isAvailable !== undefined) {
      query = query.eq('is_available', filters.isAvailable)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Get available responders near location
  async getNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    type?: ResponderType
  ): Promise<Array<Responder & { distance_km: number }>> {
    const { data, error } = await (supabase.rpc as any)('find_nearby_responders', {
      p_latitude: latitude,
      p_longitude: longitude,
      p_radius_km: radiusKm,
      p_responder_type: type || null,
    })

    if (error) throw error
    return data || []
  },

  // Update responder location
  async updateLocation(
    id: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    const { error } = await supabase
      .from('responders')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
        last_location_update: new Date().toISOString(),
      } as any)
      .eq('id', responderId)

    if (error) throw error
  },

  // Assign responder to incident
  async assignToIncident(
    responderId: string,
    incidentId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('responders')
      .update({
        assigned_incident_id: incidentId,
        is_available: false,
      } as any)
      .eq('id', responderId)

    if (error) throw error

    // Create incident response record
    await supabase.from('incident_responses').insert({
      incident_id: incidentId,
      responder_id: responderId,
    } as any)
  },
}

// =============================================
// HOTSPOTS API
// =============================================

export const hotspotsApi = {
  // Get all hotspots
  async getAll(): Promise<Hotspot[]> {
    const { data, error } = await supabase
      .from('hotspots')
      .select('*')
      .eq('is_active', true)
      .order('risk_score', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get high-risk hotspots
  async getHighRisk(minRiskScore: number = 70): Promise<Hotspot[]> {
    const { data, error } = await supabase
      .from('hotspots')
      .select('*')
      .eq('is_active', true)
      .gte('risk_score', minRiskScore)
      .order('risk_score', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Update hotspot stats (called when new incident in area)
  async incrementAccidentCount(id: string): Promise<void> {
    const { data: hotspot, error: fetchError } = await supabase
      .from('hotspots')
      .select('accident_count')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { error } = await supabase
      .from('hotspots')
      .update({
        accident_count: (hotspot?.accident_count || 0) + 1,
        last_incident_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
  },
}

// =============================================
// SMART CAMERAS API
// =============================================

export const smartCamerasApi = {
  // Get all cameras
  async getAll(): Promise<SmartCamera[]> {
    const { data, error } = await supabase
      .from('smart_cameras')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  // Get camera by ID
  async getById(id: string): Promise<SmartCamera | null> {
    const { data, error } = await supabase
      .from('smart_cameras')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Update camera stats after capture
  async recordCapture(
    cameraId: string,
    accidentDetected: boolean
  ): Promise<void> {
    const { data: camera, error: fetchError } = await supabase
      .from('smart_cameras')
      .select('total_captures, incidents_detected')
      .eq('id', cameraId)
      .single()

    if (fetchError) throw fetchError

    const updates: Partial<SmartCamera> = {
      total_captures: ((camera as any)?.total_captures || 0) + 1,
      last_capture_at: new Date().toISOString(),
    }

    if (incidentDetected) {
      updates.incidents_detected = ((camera as any)?.incidents_detected || 0) + 1
    }

    const { error } = await supabase
      .from('smart_cameras')
      .update(updates as any)
      .eq('id', cameraId)

    if (error) throw error
  },
}

// =============================================
// CAMERA CAPTURES API
// =============================================

export const cameraCapturesApi = {
  // Get captures for camera
  async getByCameraId(
    cameraId: string,
    limit: number = 50
  ): Promise<CameraCapture[]> {
    const { data, error } = await supabase
      .from('camera_captures')
      .select('*')
      .eq('camera_id', cameraId)
      .order('captured_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  // Get pending review captures
  async getPendingReview(): Promise<CameraCapture[]> {
    const { data, error } = await supabase
      .from('camera_captures')
      .select('*')
      .eq('status', 'pending_review')
      .order('captured_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create capture record
  async create(
    cameraId: string,
    imageBlob: Blob,
    analysis: {
      confidence: number
      accidentDetected: boolean
      aiAnalysis: object
    },
    location?: { latitude: number; longitude: number }
  ): Promise<CameraCapture | null> {
    const uploadResult = await uploadCameraCapture(cameraId, imageBlob)
    if (!uploadResult) return null

    const captureRecord: CameraCaptureInsert = {
      camera_id: cameraId,
      image_url: uploadResult.url,
      latitude: location?.latitude,
      longitude: location?.longitude,
      ai_confidence: analysis.confidence,
      ai_analysis: analysis.aiAnalysis,
      accident_detected: analysis.accidentDetected,
      status: analysis.confidence >= 0.8 ? 'auto_submitted' :
              analysis.confidence >= 0.5 ? 'pending_review' : 'discarded',
      processed_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('camera_captures')
      .insert(captureRecord as any)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Approve capture (create incident from it)
  async approve(
    captureId: string,
    userId: string
  ): Promise<Incident | null> {
    // Get capture details
    const { data: capture, error: fetchError } = await supabase
      .from('camera_captures')
      .select('*')
      .eq('id', captureId)
      .single()

    if (fetchError || !capture) throw fetchError

    // Create incident from capture
    const incidentData: IncidentInsert = {
      title: 'Smart Camera Detection',
      description: 'Accident detected by automated camera system',
      accident_type: 'vehicle_collision', // Default, can be updated
      severity: 'medium',
      source: 'smart_camera',
      latitude: capture.latitude || 0,
      longitude: capture.longitude || 0,
      ai_confidence: capture.ai_confidence,
      ai_analysis: capture.ai_analysis,
      is_ai_verified: false,
      smart_camera_id: capture.camera_id,
    }

    const incident = await incidentsApi.create(incidentData)

    // Update capture with incident reference
    await supabase
      .from('camera_captures')
      .update({
        status: 'approved',
        incident_id: incident.id,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', captureId)

    return incident
  },

  // Reject capture
  async reject(captureId: string, userId: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('camera_captures')
      .update({
        status: 'rejected',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        review_notes: notes,
      } as any)
      .eq('id', captureId)

    if (error) throw error
  },
}

// =============================================
// NOTIFICATIONS API
// =============================================

export const notificationsApi = {
  // Get user notifications
  async getByUserId(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Mark as read
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      } as any)
      .eq('id', notificationId)

    if (error) throw error
  },

  // Mark all as read
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      } as any)
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
  },
}

// =============================================
// USERS API
// =============================================

export const usersApi = {
  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()

    if (error) return null
    return data
  },

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User | null> {
    const currentUser = await this.getCurrentUser()
    if (!currentUser) return null

    const { data, error } = await supabase
      .from('users')
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Increment reports submitted
  async incrementReportsSubmitted(userId: string): Promise<void> {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('reports_submitted')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const { error } = await supabase
      .from('users')
      .update({
        reports_submitted: (user?.reports_submitted || 0) + 1,
      })
      .eq('id', userId)

    if (error) throw error
  },
}

// Export all APIs
export const db = {
  incidents: incidentsApi,
  incidentMedia: incidentMediaApi,
  responders: respondersApi,
  hotspots: hotspotsApi,
  smartCameras: smartCamerasApi,
  cameraCaptures: cameraCapturesApi,
  notifications: notificationsApi,
  users: usersApi,
}

export default db
