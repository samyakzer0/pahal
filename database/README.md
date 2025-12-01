# Pahal Database Schema

Complete PostgreSQL database schema for the Pahal Accident Monitoring Platform, designed for Supabase.

## Overview

The database supports:
- **Incident Management**: Full lifecycle tracking of accident reports
- **Responder Coordination**: Real-time responder location and dispatch
- **Smart Camera System**: Automated camera capture and AI analysis
- **Hotspot Analytics**: Accident-prone area identification
- **Media Storage**: Image and video storage with Supabase Storage

## Tables

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts (citizens, responders, admins) |
| `incidents` | Accident/incident reports |
| `incident_media` | Photos/videos attached to incidents |
| `responders` | Emergency responders (ambulance, police, etc.) |
| `incident_responses` | Dispatch and response tracking |
| `hotspots` | Accident-prone areas |

### Smart Camera Tables

| Table | Description |
|-------|-------------|
| `smart_cameras` | Registered camera devices |
| `camera_captures` | Captured images with AI analysis |

### Supporting Tables

| Table | Description |
|-------|-------------|
| `notifications` | User notifications |
| `audit_log` | System audit trail |
| `analytics_daily` | Aggregated daily statistics |

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Enable Extensions

Run in SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### 3. Run Schema Migration

1. Open SQL Editor in Supabase Dashboard
2. Copy contents of `schema.sql`
3. Execute the SQL

### 4. Configure Storage Buckets

Create the following buckets in Storage:

#### incident-media
- **Public**: No
- **File size limit**: 10MB
- **Allowed types**: image/jpeg, image/png, image/webp, video/mp4

#### camera-captures
- **Public**: No
- **File size limit**: 5MB
- **Allowed types**: image/jpeg, image/png, image/webp

#### user-avatars
- **Public**: Yes
- **File size limit**: 2MB
- **Allowed types**: image/jpeg, image/png, image/webp

### 5. Run Storage Policies

Copy contents of `storage.sql` and run in SQL Editor.

### 6. Configure Environment

Update `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Key Features

### PostGIS Geospatial

All location tables use PostGIS geography columns for efficient:
- Distance calculations
- Radius queries
- Nearby search

### Row Level Security (RLS)

Enabled on sensitive tables:
- Users can only view/edit their own profiles
- Incidents are publicly readable, restricted write
- Notifications are user-scoped

### Automatic Triggers

- `updated_at` timestamps auto-update
- Geography points auto-generated from lat/lng

### Useful Functions

```sql
-- Find responders within 10km
SELECT * FROM find_nearby_responders(28.6139, 77.2090, 10);

-- Count incidents in hotspot radius
SELECT count_incidents_in_radius(28.6139, 77.2090, 500, 365);
```

## Entity Relationship

```
users
  ├── incidents (reporter_id)
  ├── responders (user_id)
  ├── notifications (user_id)
  └── incident_media (uploaded_by)

incidents
  ├── incident_media
  ├── incident_responses
  └── camera_captures (incident_id)

responders
  └── incident_responses

smart_cameras
  └── camera_captures

hotspots (standalone analytics)
```

## Sample Queries

### Get active incidents with responders
```sql
SELECT 
  i.*,
  json_agg(r.*) as responders
FROM incidents i
LEFT JOIN incident_responses ir ON ir.incident_id = i.id
LEFT JOIN responders r ON r.id = ir.responder_id
WHERE i.status NOT IN ('resolved', 'false_alarm')
GROUP BY i.id
ORDER BY i.created_at DESC;
```

### Get hotspots with recent activity
```sql
SELECT *
FROM hotspots
WHERE last_incident_at > NOW() - INTERVAL '7 days'
ORDER BY risk_score DESC
LIMIT 10;
```

### Get camera detection statistics
```sql
SELECT 
  sc.name,
  sc.total_captures,
  sc.incidents_detected,
  ROUND(sc.incidents_detected::numeric / NULLIF(sc.total_captures, 0) * 100, 2) as detection_rate
FROM smart_cameras sc
WHERE sc.status = 'active'
ORDER BY detection_rate DESC;
```

## Maintenance

### Daily Analytics Update

Run this to update daily stats (or schedule as cron):
```sql
INSERT INTO analytics_daily (date, total_incidents, ...)
SELECT 
  CURRENT_DATE,
  COUNT(*),
  ...
FROM incidents
WHERE DATE(created_at) = CURRENT_DATE
ON CONFLICT (date) DO UPDATE SET ...;
```

### Cleanup Old Captures

Remove processed captures older than 30 days:
```sql
DELETE FROM camera_captures
WHERE status IN ('discarded', 'rejected')
  AND captured_at < NOW() - INTERVAL '30 days';
```
