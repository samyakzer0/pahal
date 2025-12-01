{
  "name": "Incident",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Brief title of the incident"
    },
    "description": {
      "type": "string",
      "description": "Detailed description of the accident"
    },
    "accident_type": {
      "type": "string",
      "enum": [
        "vehicle_collision",
        "pedestrian_hit",
        "motorcycle_accident",
        "truck_accident",
        "multi_vehicle",
        "hit_and_run",
        "other"
      ],
      "description": "Type of accident"
    },
    "severity": {
      "type": "string",
      "enum": [
        "critical",
        "high",
        "medium",
        "low"
      ],
      "default": "medium",
      "description": "Severity level of the incident"
    },
    "status": {
      "type": "string",
      "enum": [
        "reported",
        "acknowledged",
        "dispatched",
        "en_route",
        "on_site",
        "resolved"
      ],
      "default": "reported",
      "description": "Current status of incident response"
    },
    "latitude": {
      "type": "number",
      "description": "Latitude coordinate"
    },
    "longitude": {
      "type": "number",
      "description": "Longitude coordinate"
    },
    "address": {
      "type": "string",
      "description": "Human readable address"
    },
    "digipin": {
      "type": "string",
      "description": "DigiPin location code"
    },
    "photo_urls": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "URLs of uploaded photos"
    },
    "reporter_phone": {
      "type": "string",
      "description": "Phone number of reporter"
    },
    "reporter_name": {
      "type": "string",
      "description": "Name of the reporter"
    },
    "vehicles_involved": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Types of vehicles involved"
    },
    "estimated_casualties": {
      "type": "number",
      "description": "Estimated number of casualties"
    },
    "assigned_responder": {
      "type": "string",
      "description": "Email of assigned responder"
    },
    "response_notes": {
      "type": "string",
      "description": "Notes from responders"
    },
    "resolved_at": {
      "type": "string",
      "format": "date-time",
      "description": "When incident was resolved"
    },
    "report_count": {
      "type": "number",
      "default": 1,
      "description": "Number of reports for same incident"
    },
    "is_ai_detected": {
      "type": "boolean",
      "default": false,
      "description": "Whether detected by AI camera"
    },
    "camera_id": {
      "type": "string",
      "description": "ID of camera that detected incident"
    }
  },
  "required": [
    "latitude",
    "longitude",
    "accident_type"
  ]
}