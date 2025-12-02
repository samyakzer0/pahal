/**
 * Supabase Database TypeScript Types
 * Auto-generated types for the Pahal database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AccidentType =
  | 'vehicle_collision'
  | 'pedestrian_hit'
  | 'motorcycle_accident'
  | 'truck_accident'
  | 'multi_vehicle'
  | 'hit_and_run'
  | 'bus_accident'
  | 'auto_rickshaw'
  | 'bicycle_accident'
  | 'other'

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low'

export type IncidentStatus =
  | 'reported'
  | 'verified'
  | 'acknowledged'
  | 'dispatched'
  | 'en_route'
  | 'on_site'
  | 'resolved'
  | 'false_alarm'

export type ResponderType =
  | 'ambulance'
  | 'fire'
  | 'police'
  | 'traffic'
  | 'highway_patrol'
  | 'tow_truck'

export type ReportSource =
  | 'citizen_app'
  | 'smart_camera'
  | 'emergency_call'
  | 'traffic_police'
  | 'hospital'
  | 'other'

export type UserRole = 'citizen' | 'responder' | 'admin' | 'super_admin'

export type CameraStatus = 'active' | 'inactive' | 'maintenance' | 'offline'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string | null
          email: string
          phone: string | null
          full_name: string
          avatar_url: string | null
          role: UserRole
          is_verified: boolean
          is_active: boolean
          home_latitude: number | null
          home_longitude: number | null
          notification_radius_km: number
          reports_submitted: number
          reports_verified: number
          reputation_score: number
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          auth_id?: string | null
          email: string
          phone?: string | null
          full_name: string
          avatar_url?: string | null
          role?: UserRole
          is_verified?: boolean
          is_active?: boolean
          home_latitude?: number | null
          home_longitude?: number | null
          notification_radius_km?: number
          reports_submitted?: number
          reports_verified?: number
          reputation_score?: number
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          auth_id?: string | null
          email?: string
          phone?: string | null
          full_name?: string
          avatar_url?: string | null
          role?: UserRole
          is_verified?: boolean
          is_active?: boolean
          home_latitude?: number | null
          home_longitude?: number | null
          notification_radius_km?: number
          reports_submitted?: number
          reports_verified?: number
          reputation_score?: number
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      incidents: {
        Row: {
          id: string
          title: string
          description: string | null
          accident_type: AccidentType
          severity: SeverityLevel
          status: IncidentStatus
          latitude: number
          longitude: number
          address: string | null
          landmark: string | null

          road_name: string | null
          city: string | null
          state: string | null
          pincode: string | null
          vehicles_involved: number
          estimated_casualties: number
          injuries_count: number
          fatalities_count: number
          road_blocked: boolean
          weather_conditions: string | null
          visibility: string | null
          road_conditions: string | null
          ai_confidence: number | null
          ai_analysis: Json | null
          is_ai_verified: boolean
          source: ReportSource
          reporter_id: string | null
          smart_camera_id: string | null
          report_count: number
          acknowledged_at: string | null
          acknowledged_by: string | null
          dispatched_at: string | null
          first_responder_arrival_at: string | null
          resolved_at: string | null
          resolved_by: string | null
          resolution_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          accident_type: AccidentType
          severity?: SeverityLevel
          status?: IncidentStatus
          latitude: number
          longitude: number
          address?: string | null
          landmark?: string | null

          road_name?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          vehicles_involved?: number
          estimated_casualties?: number
          injuries_count?: number
          fatalities_count?: number
          road_blocked?: boolean
          weather_conditions?: string | null
          visibility?: string | null
          road_conditions?: string | null
          ai_confidence?: number | null
          ai_analysis?: Json | null
          is_ai_verified?: boolean
          source?: ReportSource
          reporter_id?: string | null
          smart_camera_id?: string | null
          report_count?: number
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          dispatched_at?: string | null
          first_responder_arrival_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          accident_type?: AccidentType
          severity?: SeverityLevel
          status?: IncidentStatus
          latitude?: number
          longitude?: number
          address?: string | null
          landmark?: string | null

          road_name?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          vehicles_involved?: number
          estimated_casualties?: number
          injuries_count?: number
          fatalities_count?: number
          road_blocked?: boolean
          weather_conditions?: string | null
          visibility?: string | null
          road_conditions?: string | null
          ai_confidence?: number | null
          ai_analysis?: Json | null
          is_ai_verified?: boolean
          source?: ReportSource
          reporter_id?: string | null
          smart_camera_id?: string | null
          report_count?: number
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          dispatched_at?: string | null
          first_responder_arrival_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      incident_media: {
        Row: {
          id: string
          incident_id: string
          file_name: string
          file_path: string
          file_url: string
          file_type: string
          file_size: number | null
          is_primary: boolean
          uploaded_by: string | null
          source: ReportSource | null
          ai_analysis: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          file_name: string
          file_path: string
          file_url: string
          file_type: string
          file_size?: number | null
          is_primary?: boolean
          uploaded_by?: string | null
          source?: ReportSource | null
          ai_analysis?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          file_name?: string
          file_path?: string
          file_url?: string
          file_type?: string
          file_size?: number | null
          is_primary?: boolean
          uploaded_by?: string | null
          source?: ReportSource | null
          ai_analysis?: Json | null
          created_at?: string
        }
      }
      responders: {
        Row: {
          id: string
          user_id: string | null
          name: string
          type: ResponderType
          badge_number: string | null
          vehicle_number: string | null
          phone: string
          alternate_phone: string | null
          email: string | null
          organization: string | null
          station_name: string | null
          station_address: string | null
          current_latitude: number | null
          current_longitude: number | null
          last_location_update: string | null
          is_available: boolean
          is_on_duty: boolean
          assigned_incident_id: string | null
          total_responses: number
          avg_response_time_mins: number | null
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          type: ResponderType
          badge_number?: string | null
          vehicle_number?: string | null
          phone: string
          alternate_phone?: string | null
          email?: string | null
          organization?: string | null
          station_name?: string | null
          station_address?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          last_location_update?: string | null
          is_available?: boolean
          is_on_duty?: boolean
          assigned_incident_id?: string | null
          total_responses?: number
          avg_response_time_mins?: number | null
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          type?: ResponderType
          badge_number?: string | null
          vehicle_number?: string | null
          phone?: string
          alternate_phone?: string | null
          email?: string | null
          organization?: string | null
          station_name?: string | null
          station_address?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          last_location_update?: string | null
          is_available?: boolean
          is_on_duty?: boolean
          assigned_incident_id?: string | null
          total_responses?: number
          avg_response_time_mins?: number | null
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      incident_responses: {
        Row: {
          id: string
          incident_id: string
          responder_id: string
          dispatched_at: string
          acknowledged_at: string | null
          en_route_at: string | null
          arrived_at: string | null
          completed_at: string | null
          response_time_mins: number | null
          distance_km: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          responder_id: string
          dispatched_at?: string
          acknowledged_at?: string | null
          en_route_at?: string | null
          arrived_at?: string | null
          completed_at?: string | null
          response_time_mins?: number | null
          distance_km?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          responder_id?: string
          dispatched_at?: string
          acknowledged_at?: string | null
          en_route_at?: string | null
          arrived_at?: string | null
          completed_at?: string | null
          response_time_mins?: number | null
          distance_km?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hotspots: {
        Row: {
          id: string
          name: string
          description: string | null
          latitude: number
          longitude: number
          radius_meters: number
          address: string | null
          road_name: string | null
          accident_count: number
          fatality_count: number
          injury_count: number
          risk_score: number | null
          trend: string | null
          common_accident_types: string[] | null
          peak_hours: number[] | null
          high_risk_days: string[] | null
          contributing_factors: string[] | null
          last_incident_at: string | null
          first_incident_at: string | null
          is_active: boolean
          requires_attention: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          latitude: number
          longitude: number
          radius_meters?: number
          address?: string | null
          road_name?: string | null
          accident_count?: number
          fatality_count?: number
          injury_count?: number
          risk_score?: number | null
          trend?: string | null
          common_accident_types?: string[] | null
          peak_hours?: number[] | null
          high_risk_days?: string[] | null
          contributing_factors?: string[] | null
          last_incident_at?: string | null
          first_incident_at?: string | null
          is_active?: boolean
          requires_attention?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          latitude?: number
          longitude?: number
          radius_meters?: number
          address?: string | null
          road_name?: string | null
          accident_count?: number
          fatality_count?: number
          injury_count?: number
          risk_score?: number | null
          trend?: string | null
          common_accident_types?: string[] | null
          peak_hours?: number[] | null
          high_risk_days?: string[] | null
          contributing_factors?: string[] | null
          last_incident_at?: string | null
          first_incident_at?: string | null
          is_active?: boolean
          requires_attention?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      smart_cameras: {
        Row: {
          id: string
          name: string
          camera_id: string | null
          description: string | null
          latitude: number
          longitude: number
          address: string | null
          road_name: string | null
          status: CameraStatus
          capture_interval_seconds: number
          auto_submit_threshold: number
          manual_review_threshold: number
          total_captures: number
          incidents_detected: number
          false_positives: number
          last_capture_at: string | null
          device_type: string | null
          device_model: string | null
          firmware_version: string | null
          installed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          camera_id?: string | null
          description?: string | null
          latitude: number
          longitude: number
          address?: string | null
          road_name?: string | null
          status?: CameraStatus
          capture_interval_seconds?: number
          auto_submit_threshold?: number
          manual_review_threshold?: number
          total_captures?: number
          incidents_detected?: number
          false_positives?: number
          last_capture_at?: string | null
          device_type?: string | null
          device_model?: string | null
          firmware_version?: string | null
          installed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          camera_id?: string | null
          description?: string | null
          latitude?: number
          longitude?: number
          address?: string | null
          road_name?: string | null
          status?: CameraStatus
          capture_interval_seconds?: number
          auto_submit_threshold?: number
          manual_review_threshold?: number
          total_captures?: number
          incidents_detected?: number
          false_positives?: number
          last_capture_at?: string | null
          device_type?: string | null
          device_model?: string | null
          firmware_version?: string | null
          installed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      camera_captures: {
        Row: {
          id: string
          camera_id: string
          image_url: string
          thumbnail_url: string | null
          latitude: number | null
          longitude: number | null
          ai_confidence: number | null
          ai_analysis: Json | null
          accident_detected: boolean
          status: string
          processed_at: string | null
          incident_id: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          captured_at: string
          created_at: string
        }
        Insert: {
          id?: string
          camera_id: string
          image_url: string
          thumbnail_url?: string | null
          latitude?: number | null
          longitude?: number | null
          ai_confidence?: number | null
          ai_analysis?: Json | null
          accident_detected?: boolean
          status?: string
          processed_at?: string | null
          incident_id?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          captured_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          camera_id?: string
          image_url?: string
          thumbnail_url?: string | null
          latitude?: number | null
          longitude?: number | null
          ai_confidence?: number | null
          ai_analysis?: Json | null
          accident_detected?: boolean
          status?: string
          processed_at?: string | null
          incident_id?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          captured_at?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          incident_id: string | null
          is_read: boolean
          read_at: string | null
          push_sent: boolean
          push_sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          incident_id?: string | null
          is_read?: boolean
          read_at?: string | null
          push_sent?: boolean
          push_sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          incident_id?: string | null
          is_read?: boolean
          read_at?: string | null
          push_sent?: boolean
          push_sent_at?: string | null
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          user_email: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      analytics_daily: {
        Row: {
          id: string
          date: string
          total_incidents: number
          critical_incidents: number
          high_incidents: number
          medium_incidents: number
          low_incidents: number
          resolved_incidents: number
          false_alarms: number
          avg_resolution_time_mins: number | null
          total_injuries: number
          total_fatalities: number
          avg_response_time_mins: number | null
          total_dispatches: number
          citizen_reports: number
          camera_detections: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          total_incidents?: number
          critical_incidents?: number
          high_incidents?: number
          medium_incidents?: number
          low_incidents?: number
          resolved_incidents?: number
          false_alarms?: number
          avg_resolution_time_mins?: number | null
          total_injuries?: number
          total_fatalities?: number
          avg_response_time_mins?: number | null
          total_dispatches?: number
          citizen_reports?: number
          camera_detections?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_incidents?: number
          critical_incidents?: number
          high_incidents?: number
          medium_incidents?: number
          low_incidents?: number
          resolved_incidents?: number
          false_alarms?: number
          avg_resolution_time_mins?: number | null
          total_injuries?: number
          total_fatalities?: number
          avg_response_time_mins?: number | null
          total_dispatches?: number
          citizen_reports?: number
          camera_detections?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      find_nearby_responders: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_radius_km?: number
          p_responder_type?: ResponderType | null
        }
        Returns: {
          id: string
          name: string
          type: ResponderType
          phone: string
          distance_km: number
        }[]
      }
      count_incidents_in_radius: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_radius_meters?: number
          p_days?: number
        }
        Returns: number
      }
    }
  }
}

// Helper types for common use cases
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Incident = Database['public']['Tables']['incidents']['Row']
export type IncidentInsert = Database['public']['Tables']['incidents']['Insert']
export type IncidentUpdate = Database['public']['Tables']['incidents']['Update']

export type IncidentMedia = Database['public']['Tables']['incident_media']['Row']
export type IncidentMediaInsert = Database['public']['Tables']['incident_media']['Insert']

export type Responder = Database['public']['Tables']['responders']['Row']
export type ResponderInsert = Database['public']['Tables']['responders']['Insert']
export type ResponderUpdate = Database['public']['Tables']['responders']['Update']

export type Hotspot = Database['public']['Tables']['hotspots']['Row']
export type HotspotInsert = Database['public']['Tables']['hotspots']['Insert']
export type HotspotUpdate = Database['public']['Tables']['hotspots']['Update']

export type SmartCamera = Database['public']['Tables']['smart_cameras']['Row']
export type SmartCameraInsert = Database['public']['Tables']['smart_cameras']['Insert']

export type CameraCapture = Database['public']['Tables']['camera_captures']['Row']
export type CameraCaptureInsert = Database['public']['Tables']['camera_captures']['Insert']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export type AnalyticsDaily = Database['public']['Tables']['analytics_daily']['Row']
