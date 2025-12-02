/**
 * Smart Camera Service
 * Simulates IoT CCTV cameras using device webcam/mobile camera
 * for automatic accident detection and reporting
 */

import { analyzeAccidentImage, AccidentAnalysis } from './perplexityService'
import { incidentsApi, incidentMediaApi } from './api'
import type { IncidentInsert } from './database.types'


// Smart Camera configuration
export interface SmartCameraConfig {
  enabled: boolean
  captureIntervalSeconds: number
  autoSubmitThreshold: number // Confidence threshold for auto-submit (0-1)
  manualReviewThreshold: number // Below this, discard. Above this but below autoSubmit, queue for review
  locationTracking: boolean
}

// Capture data structure
export interface SmartCameraCapture {
  id: string
  imageData: string // Base64
  timestamp: string
  location: {
    lat: number
    lng: number
    address: string
  } | null
  status: 'pending' | 'analyzing' | 'auto-submitted' | 'pending-review' | 'discarded' | 'manually-submitted' | 'rejected'
  analysis?: AccidentAnalysis
  error?: string
}

class SmartCameraService {
  private config: SmartCameraConfig
  private videoStream: MediaStream | null = null
  private captureInterval: ReturnType<typeof setInterval> | null = null
  private canvas: HTMLCanvasElement | null = null
  private isCapturing = false
  private onCaptureCallback: ((capture: SmartCameraCapture) => void) | null = null
  private onStatusChangeCallback: ((status: string) => void) | null = null

  private defaultConfig: SmartCameraConfig = {
    enabled: false,
    captureIntervalSeconds: 15,
    autoSubmitThreshold: 0.80, // 80% confidence = auto submit
    manualReviewThreshold: 0.50, // 50-80% = manual review, below 50% = discard
    locationTracking: true,
  }

  constructor() {
    this.config = this.loadConfig()
    this.canvas = document.createElement('canvas')
    this.canvas.width = 1280
    this.canvas.height = 720
  }

  // Get current config
  getConfig(): SmartCameraConfig {
    return { ...this.config }
  }

  // Update config
  updateConfig(newConfig: Partial<SmartCameraConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
  }

  // Set capture callback
  onCapture(callback: (capture: SmartCameraCapture) => void): void {
    this.onCaptureCallback = callback
  }

  // Set status change callback
  onStatusChange(callback: (status: string) => void): void {
    this.onStatusChangeCallback = callback
  }

  // Check if camera is supported (instance method)
  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  // Check if camera is supported (static method)
  static checkSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  // Request camera access
  async requestCameraAccess(): Promise<MediaStream> {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    const constraints: MediaStreamConstraints = {
      video: isMobile
        ? { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        : { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    }

    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.videoStream
    } catch (error) {
      console.error('Camera access denied:', error)
      throw new Error('Camera access required for Smart Camera feature')
    }
  }

  // Get video stream
  getVideoStream(): MediaStream | null {
    return this.videoStream
  }

  // Start automatic capture
  async startCapture(): Promise<void> {
    if (!this.videoStream) {
      await this.requestCameraAccess()
    }

    this.config.enabled = true
    this.saveConfig()

    // Clear existing interval
    if (this.captureInterval) {
      clearInterval(this.captureInterval)
    }

    this.onStatusChangeCallback?.('Camera active - monitoring started')

    // Start capture interval
    this.captureInterval = setInterval(() => {
      this.captureAndAnalyze()
    }, this.config.captureIntervalSeconds * 1000)

    // Initial capture
    setTimeout(() => this.captureAndAnalyze(), 1000)
  }

  // Stop capture
  stopCapture(): void {
    this.config.enabled = false
    this.saveConfig()

    if (this.captureInterval) {
      clearInterval(this.captureInterval)
      this.captureInterval = null
    }

    this.onStatusChangeCallback?.('Camera stopped')
  }

  // Release camera
  releaseCamera(): void {
    this.stopCapture()

    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop())
      this.videoStream = null
    }
  }

  // Capture image from video stream
  private captureFrame(): string | null {
    if (!this.videoStream || !this.canvas) return null

    const video = document.createElement('video')
    video.srcObject = this.videoStream
    video.autoplay = true
    video.muted = true

    const ctx = this.canvas.getContext('2d')
    if (!ctx) return null

    // Get video track settings
    const track = this.videoStream.getVideoTracks()[0]
    const settings = track?.getSettings()

    if (settings?.width && settings?.height) {
      this.canvas.width = settings.width
      this.canvas.height = settings.height
    }

    ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height)
    return this.canvas.toDataURL('image/jpeg', 0.85)
  }

  // Main capture and analyze function
  async captureAndAnalyze(): Promise<SmartCameraCapture | null> {
    if (this.isCapturing) return null

    this.isCapturing = true
    this.onStatusChangeCallback?.('Capturing frame...')

    try {
      // Wait a moment for video to be ready
      await new Promise(resolve => setTimeout(resolve, 500))

      const imageData = this.captureFrame()
      if (!imageData) {
        throw new Error('Failed to capture frame')
      }

      // Get location
      let location = null
      if (this.config.locationTracking) {
        try {
          location = await this.getCurrentLocation()
        } catch (e) {
          console.warn('Location unavailable:', e)
        }
      }

      // Create capture record
      const capture: SmartCameraCapture = {
        id: `cam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        imageData,
        timestamp: new Date().toISOString(),
        location,
        status: 'analyzing',
      }

      this.onStatusChangeCallback?.('Analyzing with Perplexity AI...')

      // Convert base64 to File for analysis
      const response = await fetch(imageData)
      const blob = await response.blob()
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })

      // Analyze with Perplexity AI
      const analysis = await analyzeAccidentImage(file)
      capture.analysis = analysis

      // Determine status based on confidence
      if (analysis.confidence >= this.config.autoSubmitThreshold) {
        capture.status = 'auto-submitted'
        this.onStatusChangeCallback?.(`🚨 Incident detected! Auto-submitting (${Math.round(analysis.confidence * 100)}% confidence)`)
        // Submit to database automatically
        await this.submitCaptureToDatabase(capture)
        this.storeCapture(capture)
      } else if (analysis.confidence >= this.config.manualReviewThreshold) {
        capture.status = 'pending-review'
        this.onStatusChangeCallback?.(`⚠️ Potential incident - needs review (${Math.round(analysis.confidence * 100)}% confidence)`)
        this.storeCapture(capture)
      } else {
        capture.status = 'discarded'
        this.onStatusChangeCallback?.(`✓ No incident detected (${Math.round(analysis.confidence * 100)}% confidence)`)
      }

      this.onCaptureCallback?.(capture)
      return capture

    } catch (error) {
      console.error('Capture/analysis error:', error)
      this.onStatusChangeCallback?.(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    } finally {
      this.isCapturing = false
    }
  }

  // Manual capture trigger
  async manualCapture(): Promise<SmartCameraCapture | null> {
    return this.captureAndAnalyze()
  }

  // Get current location
  private getCurrentLocation(): Promise<{ lat: number; lng: number; address: string }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // Reverse geocode
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            )
            const data = await response.json()
            if (data.display_name) {
              address = data.display_name
            }
          } catch (e) {
            console.warn('Geocoding failed:', e)
          }

          resolve({ lat: latitude, lng: longitude, address })
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  // Store capture in localStorage
  private storeCapture(capture: SmartCameraCapture): void {
    const captures = this.getStoredCaptures()
    captures.unshift(capture)

    // Keep only last 100 captures
    if (captures.length > 100) {
      captures.splice(100)
    }

    localStorage.setItem('smart_camera_captures', JSON.stringify(captures))
  }

  // Get stored captures
  getStoredCaptures(): SmartCameraCapture[] {
    try {
      const data = localStorage.getItem('smart_camera_captures')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  // Get pending review captures
  getPendingReviewCaptures(): SmartCameraCapture[] {
    return this.getStoredCaptures().filter(c => c.status === 'pending-review')
  }

  // Approve a pending capture
  async approveCapture(captureId: string): Promise<void> {
    const captures = this.getStoredCaptures()
    const capture = captures.find(c => c.id === captureId)
    if (capture) {
      capture.status = 'manually-submitted'
      // Submit to database
      await this.submitCaptureToDatabase(capture)
      localStorage.setItem('smart_camera_captures', JSON.stringify(captures))
    }
  }

  // Submit capture to database
  private async submitCaptureToDatabase(capture: SmartCameraCapture): Promise<void> {
    try {
      if (!capture.analysis || !capture.location) {
        console.error('Cannot submit capture: missing analysis or location')
        return
      }


      // Prepare incident data
      const incidentData: IncidentInsert = {
        title: capture.analysis.title || `${capture.analysis.accidentType.replace('_', ' ')} - Smart Camera`,
        description: capture.analysis.description,
        accident_type: capture.analysis.accidentType as any,
        severity: capture.analysis.severity as any,
        status: 'reported',
        latitude: capture.location.lat,
        longitude: capture.location.lng,
        address: capture.location.address,

        source: 'smart_camera',
        ai_confidence: capture.analysis.confidence,
        ai_analysis: JSON.stringify(capture.analysis),
        is_ai_verified: true,
        vehicles_involved: capture.analysis.vehiclesInvolved || 1,
        estimated_casualties: capture.analysis.estimatedCasualties || 0,
      }

      console.log('Submitting smart camera capture to database...', incidentData)

      // Create incident
      const createdIncident = await incidentsApi.create(incidentData)
      console.log('Smart camera incident created:', createdIncident.id)

      // Upload image
      if (capture.imageData) {
        // Convert base64 to blob
        const response = await fetch(capture.imageData)
        const blob = await response.blob()
        const file = new File([blob], `camera_capture_${capture.id}.jpg`, { type: 'image/jpeg' })

        await incidentMediaApi.upload(createdIncident.id, file, true)
        console.log('Smart camera image uploaded')
      }

    } catch (error) {
      console.error('Failed to submit smart camera capture to database:', error)
      throw error
    }
  }

  // Reject a pending capture
  rejectCapture(captureId: string): void {
    const captures = this.getStoredCaptures()
    const capture = captures.find(c => c.id === captureId)
    if (capture) {
      capture.status = 'rejected'
      localStorage.setItem('smart_camera_captures', JSON.stringify(captures))
    }
  }

  // Clear all captures
  clearCaptures(): void {
    localStorage.removeItem('smart_camera_captures')
  }

  // Get statistics
  getStatistics(): {
    totalCaptures: number
    autoSubmitted: number
    pendingReview: number
    discarded: number
    isActive: boolean
  } {
    const captures = this.getStoredCaptures()
    return {
      totalCaptures: captures.length,
      autoSubmitted: captures.filter(c => c.status === 'auto-submitted').length,
      pendingReview: captures.filter(c => c.status === 'pending-review').length,
      discarded: captures.filter(c => c.status === 'discarded').length,
      isActive: this.config.enabled,
    }
  }

  // Load config from localStorage
  private loadConfig(): SmartCameraConfig {
    try {
      const stored = localStorage.getItem('smart_camera_config')
      if (stored) {
        return { ...this.defaultConfig, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.error('Error loading config:', e)
    }
    return { ...this.defaultConfig }
  }

  // Save config to localStorage
  private saveConfig(): void {
    localStorage.setItem('smart_camera_config', JSON.stringify(this.config))
  }
}

// Singleton instance
export const smartCameraService = new SmartCameraService()
export default smartCameraService
