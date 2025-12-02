-- =============================================
-- PAHAL - Accident Monitoring Platform
-- Complete Database Schema for Supabase
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE accident_type AS ENUM (
  'vehicle_collision',
  'pedestrian_hit',
  'motorcycle_accident',
  'truck_accident',
  'multi_vehicle',
  'hit_and_run',
  'bus_accident',
  'auto_rickshaw',
  'bicycle_accident',
  'other'
);

CREATE TYPE severity_level AS ENUM (
  'critical',
  'high',
  'medium',
  'low'
);

CREATE TYPE incident_status AS ENUM (
  'reported',
  'verified',
  'acknowledged',
  'dispatched',
  'en_route',
  'on_site',
  'resolved',
  'false_alarm'
);

CREATE TYPE responder_type AS ENUM (
  'ambulance',
  'fire',
  'police',
  'traffic',
  'highway_patrol',
  'tow_truck'
);

CREATE TYPE report_source AS ENUM (
  'citizen_app',
  'smart_camera',
  'emergency_call',
  'traffic_police',
  'hospital',
  'other'
);

CREATE TYPE user_role AS ENUM (
  'citizen',
  'responder',
  'admin',
  'super_admin'
);

CREATE TYPE camera_status AS ENUM (
  'active',
  'inactive',
  'maintenance',
  'offline'
);

CREATE TYPE admin_role AS ENUM (
  'admin',
  'super_admin'
);

-- =============================================
-- ADMINS TABLE
-- =============================================

CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role admin_role DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Permissions
  can_manage_incidents BOOLEAN DEFAULT TRUE,
  can_manage_responders BOOLEAN DEFAULT TRUE,
  can_manage_cameras BOOLEAN DEFAULT TRUE,
  can_view_analytics BOOLEAN DEFAULT TRUE,
  can_manage_admins BOOLEAN DEFAULT FALSE, -- Only super_admin
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);

-- =============================================
-- USERS TABLE (for citizens/public users)
-- =============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'citizen',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Location preferences
  home_latitude DECIMAL(10, 8),
  home_longitude DECIMAL(11, 8),
  notification_radius_km INTEGER DEFAULT 5,
  
  -- Stats
  reports_submitted INTEGER DEFAULT 0,
  reports_verified INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 100,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- =============================================
-- INCIDENTS TABLE
-- =============================================

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  accident_type accident_type NOT NULL,
  severity severity_level DEFAULT 'medium',
  status incident_status DEFAULT 'reported',
  
  -- Location
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  landmark VARCHAR(255),

  road_name VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  -- Details
  vehicles_involved INTEGER DEFAULT 1,
  estimated_casualties INTEGER DEFAULT 0,
  injuries_count INTEGER DEFAULT 0,
  fatalities_count INTEGER DEFAULT 0,
  road_blocked BOOLEAN DEFAULT FALSE,
  weather_conditions VARCHAR(100),
  visibility VARCHAR(50),
  road_conditions VARCHAR(100),
  
  -- AI Analysis
  ai_confidence DECIMAL(5, 4),
  ai_analysis JSONB,
  is_ai_verified BOOLEAN DEFAULT FALSE,
  
  -- Source & Reporting
  source report_source DEFAULT 'citizen_app',
  reporter_id UUID REFERENCES users(id),
  smart_camera_id UUID,
  report_count INTEGER DEFAULT 1,
  
  -- Response tracking
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),
  dispatched_at TIMESTAMPTZ,
  first_responder_arrival_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index for location queries
CREATE INDEX idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);

-- =============================================
-- INCIDENT MEDIA TABLE
-- =============================================

CREATE TABLE incident_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  
  -- File info
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- image/jpeg, image/png, video/mp4
  file_size INTEGER, -- in bytes
  
  -- Metadata
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES users(id),
  source report_source,
  
  -- AI Analysis for this specific image
  ai_analysis JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incident_media_incident ON incident_media(incident_id);

-- =============================================
-- RESPONDERS TABLE
-- =============================================

CREATE TABLE responders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  type responder_type NOT NULL,
  badge_number VARCHAR(50),
  vehicle_number VARCHAR(50),
  
  -- Contact
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Organization
  organization VARCHAR(255),
  station_name VARCHAR(255),
  station_address TEXT,
  
  -- Location
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  current_location GEOGRAPHY(POINT, 4326),
  last_location_update TIMESTAMPTZ,
  
  -- Status
  is_available BOOLEAN DEFAULT TRUE,
  is_on_duty BOOLEAN DEFAULT TRUE,
  assigned_incident_id UUID REFERENCES incidents(id),
  
  -- Stats
  total_responses INTEGER DEFAULT 0,
  avg_response_time_mins DECIMAL(8, 2),
  rating DECIMAL(3, 2) DEFAULT 5.00,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_responders_location ON responders USING GIST(current_location);
CREATE INDEX idx_responders_type ON responders(type);
CREATE INDEX idx_responders_available ON responders(is_available) WHERE is_available = TRUE;

-- =============================================
-- INCIDENT RESPONSES TABLE (Dispatch History)
-- =============================================

CREATE TABLE incident_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES responders(id),
  
  -- Status tracking
  dispatched_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  en_route_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metrics
  response_time_mins DECIMAL(8, 2),
  distance_km DECIMAL(8, 2),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incident_responses_incident ON incident_responses(incident_id);
CREATE INDEX idx_incident_responses_responder ON incident_responses(responder_id);

-- =============================================
-- HOTSPOTS TABLE
-- =============================================

CREATE TABLE hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Location
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  radius_meters INTEGER DEFAULT 500,
  address TEXT,
  road_name VARCHAR(255),
  
  -- Statistics
  accident_count INTEGER DEFAULT 0,
  fatality_count INTEGER DEFAULT 0,
  injury_count INTEGER DEFAULT 0,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  trend VARCHAR(20), -- 'increasing', 'decreasing', 'stable'
  
  -- Analysis
  common_accident_types TEXT[],
  peak_hours INTEGER[],
  high_risk_days TEXT[],
  contributing_factors TEXT[],
  
  -- Time tracking
  last_incident_at TIMESTAMPTZ,
  first_incident_at TIMESTAMPTZ,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  requires_attention BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hotspots_location ON hotspots USING GIST(location);
CREATE INDEX idx_hotspots_risk_score ON hotspots(risk_score DESC);

-- =============================================
-- SMART CAMERAS TABLE
-- =============================================

CREATE TABLE smart_cameras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  camera_id VARCHAR(100) UNIQUE,
  description TEXT,
  
  -- Location
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  road_name VARCHAR(255),
  
  -- Configuration
  status camera_status DEFAULT 'active',
  capture_interval_seconds INTEGER DEFAULT 15,
  auto_submit_threshold DECIMAL(3, 2) DEFAULT 0.80,
  manual_review_threshold DECIMAL(3, 2) DEFAULT 0.50,
  
  -- Stats
  total_captures INTEGER DEFAULT 0,
  incidents_detected INTEGER DEFAULT 0,
  false_positives INTEGER DEFAULT 0,
  last_capture_at TIMESTAMPTZ,
  
  -- Device info
  device_type VARCHAR(100),
  device_model VARCHAR(100),
  firmware_version VARCHAR(50),
  
  -- Timestamps
  installed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_smart_cameras_location ON smart_cameras USING GIST(location);
CREATE INDEX idx_smart_cameras_status ON smart_cameras(status);

-- =============================================
-- CAMERA CAPTURES TABLE
-- =============================================

CREATE TABLE camera_captures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camera_id UUID NOT NULL REFERENCES smart_cameras(id) ON DELETE CASCADE,
  
  -- Image data
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Location (at time of capture)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- AI Analysis
  ai_confidence DECIMAL(5, 4),
  ai_analysis JSONB,
  accident_detected BOOLEAN DEFAULT FALSE,
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'pending', -- pending, processed, auto_submitted, manual_review, discarded
  processed_at TIMESTAMPTZ,
  
  -- Linked incident (if auto-submitted or approved)
  incident_id UUID REFERENCES incidents(id),
  
  -- Review info
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Timestamps
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_camera_captures_camera ON camera_captures(camera_id);
CREATE INDEX idx_camera_captures_status ON camera_captures(status);
CREATE INDEX idx_camera_captures_captured_at ON camera_captures(captured_at DESC);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'incident_nearby', 'status_update', 'dispatch', 'system'
  
  -- Related entities
  incident_id UUID REFERENCES incidents(id),
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Push notification
  push_sent BOOLEAN DEFAULT FALSE,
  push_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- =============================================
-- AUDIT LOG TABLE
-- =============================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Who
  user_id UUID REFERENCES users(id),
  user_email VARCHAR(255),
  
  -- What
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  
  -- Details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- =============================================
-- ANALYTICS DAILY STATS TABLE
-- =============================================

CREATE TABLE analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  
  -- Incident stats
  total_incidents INTEGER DEFAULT 0,
  critical_incidents INTEGER DEFAULT 0,
  high_incidents INTEGER DEFAULT 0,
  medium_incidents INTEGER DEFAULT 0,
  low_incidents INTEGER DEFAULT 0,
  
  -- Resolution stats
  resolved_incidents INTEGER DEFAULT 0,
  false_alarms INTEGER DEFAULT 0,
  avg_resolution_time_mins DECIMAL(8, 2),
  
  -- Casualty stats
  total_injuries INTEGER DEFAULT 0,
  total_fatalities INTEGER DEFAULT 0,
  
  -- Response stats
  avg_response_time_mins DECIMAL(8, 2),
  total_dispatches INTEGER DEFAULT 0,
  
  -- Source breakdown
  citizen_reports INTEGER DEFAULT 0,
  camera_detections INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_daily_date ON analytics_daily(date DESC);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_responders_updated_at BEFORE UPDATE ON responders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hotspots_updated_at BEFORE UPDATE ON hotspots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_smart_cameras_updated_at BEFORE UPDATE ON smart_cameras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate location geography from lat/lng
CREATE OR REPLACE FUNCTION generate_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_incidents_location BEFORE INSERT OR UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION generate_location_point();

CREATE TRIGGER generate_responders_location BEFORE INSERT OR UPDATE ON responders
  FOR EACH ROW EXECUTE FUNCTION generate_location_point();

CREATE TRIGGER generate_hotspots_location BEFORE INSERT OR UPDATE ON hotspots
  FOR EACH ROW EXECUTE FUNCTION generate_location_point();

CREATE TRIGGER generate_smart_cameras_location BEFORE INSERT OR UPDATE ON smart_cameras
  FOR EACH ROW EXECUTE FUNCTION generate_location_point();

-- Function to find nearby responders
CREATE OR REPLACE FUNCTION find_nearby_responders(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_radius_km INTEGER DEFAULT 10,
  p_responder_type responder_type DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  type responder_type,
  phone VARCHAR,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.type,
    r.phone,
    ROUND((ST_Distance(
      r.current_location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
    ) / 1000)::DECIMAL, 2) as distance_km
  FROM responders r
  WHERE r.is_available = TRUE
    AND r.is_on_duty = TRUE
    AND r.current_location IS NOT NULL
    AND (p_responder_type IS NULL OR r.type = p_responder_type)
    AND ST_DWithin(
      r.current_location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to find incidents in hotspot radius
CREATE OR REPLACE FUNCTION count_incidents_in_radius(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_radius_meters INTEGER DEFAULT 500,
  p_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
  incident_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO incident_count
  FROM incidents
  WHERE location IS NOT NULL
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND ST_DWithin(
      location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_meters
    );
  RETURN incident_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

-- Incidents policies (public read, authenticated write)
CREATE POLICY "Anyone can view incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create incidents"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update incidents"
  ON incidents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'responder')
    )
  );

-- Incident media policies
CREATE POLICY "Anyone can view incident media"
  ON incident_media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload media"
  ON incident_media FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Public can create incidents (no auth required for reporting)
CREATE POLICY "Public can create incidents"
  ON incidents FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view incidents"
  ON incidents FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can upload incident media"
  ON incident_media FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view incident media"
  ON incident_media FOR SELECT
  TO anon
  USING (true);

-- Admins policies
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own profile"
  ON admins FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Super admins can manage all admins"
  ON admins FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE auth_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- =============================================
-- SAMPLE SEED DATA
-- =============================================

-- Insert sample admins
INSERT INTO admins (email, full_name, role, can_manage_admins) VALUES
  ('admin@pahal.in', 'Admin User', 'admin', FALSE),
  ('superadmin@pahal.in', 'Super Admin', 'super_admin', TRUE);

-- Insert sample hotspots (Delhi NCR accident-prone areas)
INSERT INTO hotspots (name, latitude, longitude, radius_meters, accident_count, risk_score, common_accident_types) VALUES
  ('Mahipalpur Flyover', 28.5505, 77.1174, 500, 45, 85, ARRAY['vehicle_collision', 'motorcycle_accident']),
  ('Signature Bridge', 28.7028, 77.2273, 400, 32, 78, ARRAY['multi_vehicle', 'vehicle_collision']),
  ('Rajouri Garden Junction', 28.6453, 77.1193, 350, 28, 72, ARRAY['pedestrian_hit', 'motorcycle_accident']),
  ('NH-48 Gurgaon Toll', 28.4689, 77.0266, 600, 52, 88, ARRAY['truck_accident', 'multi_vehicle']),
  ('Ashram Chowk', 28.5704, 77.2507, 400, 38, 80, ARRAY['vehicle_collision', 'hit_and_run']);
