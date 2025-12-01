{
  "name": "Responder",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Responder name"
    },
    "type": {
      "type": "string",
      "enum": [
        "ambulance",
        "fire",
        "police",
        "traffic"
      ],
      "description": "Type of emergency service"
    },
    "phone": {
      "type": "string",
      "description": "Contact phone"
    },
    "email": {
      "type": "string",
      "description": "Email address"
    },
    "is_available": {
      "type": "boolean",
      "default": true,
      "description": "Currently available for dispatch"
    },
    "current_location_lat": {
      "type": "number",
      "description": "Current latitude"
    },
    "current_location_lng": {
      "type": "number",
      "description": "Current longitude"
    },
    "assigned_incident_id": {
      "type": "string",
      "description": "Currently assigned incident"
    },
    "total_responses": {
      "type": "number",
      "default": 0,
      "description": "Total incidents responded to"
    },
    "avg_response_time_mins": {
      "type": "number",
      "description": "Average response time in minutes"
    }
  },
  "required": [
    "name",
    "type",
    "phone"
  ]
}