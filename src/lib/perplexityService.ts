// Perplexity AI Service for accident image analysis

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

// Store your API key in environment variable
// Create a .env file with: VITE_PERPLEXITY_API_KEY=your_api_key_here
const getApiKey = () => {
  return import.meta.env.VITE_PERPLEXITY_API_KEY || ''
}

export interface AccidentAnalysis {
  accidentType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  vehiclesInvolved: number
  estimatedCasualties: number
  recommendations: string[]
  confidence: number
}

/**
 * Convert image file to base64 for API transmission
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Extract base64 data without the data URL prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Analyze accident image using Perplexity AI
 */
export const analyzeAccidentImage = async (
  imageFile: File
): Promise<AccidentAnalysis> => {
  const apiKey = getApiKey()
  
  if (!apiKey) {
    console.warn('Perplexity API key not found, using mock analysis')
    return getMockAnalysis()
  }

  try {
    const base64Image = await imageToBase64(imageFile)
    const mimeType = imageFile.type || 'image/jpeg'

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specialized in analyzing road accident images for emergency response systems. 
            Analyze the provided image and extract the following information in JSON format:
            {
              "accidentType": "vehicle_collision | pedestrian_hit | motorcycle_accident | truck_accident | multi_vehicle | hit_and_run | other",
              "severity": "low | medium | high | critical",
              "title": "Brief title describing the accident (max 50 chars)",
              "description": "Detailed description of what you observe (2-3 sentences)",
              "vehiclesInvolved": number,
              "estimatedCasualties": number (0 if unclear),
              "recommendations": ["array of 2-3 immediate action recommendations"],
              "confidence": number between 0 and 1
            }
            
            Severity guidelines:
            - low: Minor damage, no visible injuries
            - medium: Moderate damage, possible minor injuries
            - high: Significant damage, likely injuries
            - critical: Severe damage, life-threatening situation
            
            Only respond with valid JSON, no additional text.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this accident image and provide the structured JSON response as specified.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Perplexity API error:', errorText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in API response')
    }

    // Parse the JSON response
    const analysis = JSON.parse(content) as AccidentAnalysis
    return analysis

  } catch (error) {
    console.error('Error analyzing image with Perplexity:', error)
    // Fall back to mock analysis on error
    return getMockAnalysis()
  }
}

/**
 * Analyze accident from description text using Perplexity AI
 */
export const analyzeAccidentDescription = async (
  description: string
): Promise<Partial<AccidentAnalysis>> => {
  const apiKey = getApiKey()
  
  if (!apiKey) {
    console.warn('Perplexity API key not found')
    return {}
  }

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for an emergency response system. Based on the accident description provided, suggest appropriate values in JSON format:
            {
              "accidentType": "vehicle_collision | pedestrian_hit | motorcycle_accident | truck_accident | multi_vehicle | hit_and_run | other",
              "severity": "low | medium | high | critical",
              "recommendations": ["array of 2-3 immediate action recommendations"]
            }
            Only respond with valid JSON.`
          },
          {
            role: 'user',
            content: description
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (content) {
      return JSON.parse(content)
    }
    
    return {}
  } catch (error) {
    console.error('Error analyzing description:', error)
    return {}
  }
}

/**
 * Mock analysis for development/testing without API key
 */
const getMockAnalysis = (): AccidentAnalysis => {
  const types = ['vehicle_collision', 'motorcycle_accident', 'multi_vehicle', 'truck_accident']
  const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['medium', 'high', 'critical']
  
  return {
    accidentType: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    title: 'Vehicle collision detected on roadway',
    description: 'AI analysis detected a road accident involving vehicles. Emergency response may be required based on the apparent severity of the incident.',
    vehiclesInvolved: Math.floor(Math.random() * 3) + 1,
    estimatedCasualties: Math.floor(Math.random() * 2),
    recommendations: [
      'Dispatch emergency medical services',
      'Alert traffic control to manage congestion',
      'Notify local law enforcement'
    ],
    confidence: 0.75 + Math.random() * 0.2
  }
}

export default {
  analyzeAccidentImage,
  analyzeAccidentDescription,
  imageToBase64,
}
