{
  "name": "Hotspot",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Name of the hotspot zone"
    },
    "latitude": {
      "type": "number",
      "description": "Center latitude"
    },
    "longitude": {
      "type": "number",
      "description": "Center longitude"
    },
    "radius_meters": {
      "type": "number",
      "default": 500,
      "description": "Radius of hotspot zone"
    },
    "accident_count": {
      "type": "number",
      "default": 0,
      "description": "Total accidents in this zone"
    },
    "risk_score": {
      "type": "number",
      "description": "Risk score 1-100"
    },
    "last_incident_date": {
      "type": "string",
      "format": "date-time",
      "description": "Date of last incident"
    },
    "common_accident_types": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Most common accident types here"
    }
  },
  "required": [
    "name",
    "latitude",
    "longitude"
  ]
}