import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Play,
  Pause,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Zap,
  Eye,
  Trash2,
  ChevronRight,
  Video,
  VideoOff,
  Loader2,
  Shield,
  Activity,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Label } from '../components/ui/Label'
import { smartCameraService, SmartCameraCapture } from '../lib/smartCameraService'
import { format } from 'date-fns'

export default function SmartCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [cameraActive, setCameraActive] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [status, setStatus] = useState('Camera inactive')
  const [config, setConfig] = useState(smartCameraService.getConfig())
  const [captures, setCaptures] = useState<SmartCameraCapture[]>([])
  const [selectedCapture, setSelectedCapture] = useState<SmartCameraCapture | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [stats, setStats] = useState(smartCameraService.getStatistics())

  // Check browser support
  useEffect(() => {
    setIsSupported(smartCameraService.isSupported())
    setCaptures(smartCameraService.getStoredCaptures())
    setStats(smartCameraService.getStatistics())
  }, [])

  // Setup callbacks
  useEffect(() => {
    smartCameraService.onCapture((capture: SmartCameraCapture) => {
      setCaptures(smartCameraService.getStoredCaptures())
      setStats(smartCameraService.getStatistics())
    })

    smartCameraService.onStatusChange((newStatus: string) => {
      setStatus(newStatus)
    })

    return () => {
      smartCameraService.releaseCamera()
    }
  }, [])

  // Start camera preview
  const startCamera = async () => {
    try {
      setStatus('Requesting camera access...')
      const stream = await smartCameraService.requestCameraAccess()

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraActive(true)
      setStatus('Camera ready - Click "Start Monitoring" to begin')
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to access camera'}`)
    }
  }

  // Stop camera
  const stopCamera = () => {
    smartCameraService.releaseCamera()
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setIsMonitoring(false)
    setStatus('Camera inactive')
  }

  // Start monitoring
  const startMonitoring = async () => {
    await smartCameraService.startCapture()
    setIsMonitoring(true)
    setConfig(smartCameraService.getConfig())
  }

  // Stop monitoring
  const stopMonitoring = () => {
    smartCameraService.stopCapture()
    setIsMonitoring(false)
    setConfig(smartCameraService.getConfig())
  }

  // Manual capture
  const triggerManualCapture = async () => {
    setStatus('Manual capture in progress...')
    await smartCameraService.manualCapture()
  }

  // Update config
  const updateConfig = (key: string, value: number | boolean) => {
    smartCameraService.updateConfig({ [key]: value })
    setConfig(smartCameraService.getConfig())
  }

  // Approve capture
  const approveCapture = async (captureId: string) => {
    try {
      setStatus('Submitting to database...')
      await smartCameraService.approveCapture(captureId)
      setCaptures(smartCameraService.getStoredCaptures())
      setStats(smartCameraService.getStatistics())
      setSelectedCapture(null)
      setStatus('Successfully submitted to database')
    } catch (error) {
      console.error('Failed to approve capture:', error)
      setStatus(`Error: Failed to submit - ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Reject capture
  const rejectCapture = (captureId: string) => {
    smartCameraService.rejectCapture(captureId)
    setCaptures(smartCameraService.getStoredCaptures())
    setStats(smartCameraService.getStatistics())
    setSelectedCapture(null)
  }

  // Clear all captures
  const clearCaptures = () => {
    smartCameraService.clearCaptures()
    setCaptures([])
    setStats(smartCameraService.getStatistics())
  }

  const pendingReviewCount = captures.filter(c => c.status === 'pending-review').length

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-sm border border-gray-100">
          <VideoOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Camera Not Supported</h2>
          <p className="text-gray-600">
            Your browser doesn't support camera access. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Smart Camera
            </h1>
            <p className="text-gray-500 mt-1">AI-powered accident detection using device camera</p>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCaptures}</p>
                <p className="text-xs text-gray-500">Total Captures</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.autoSubmitted}</p>
                <p className="text-xs text-gray-500">Auto-Submitted</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
                <p className="text-xs text-gray-500">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMonitoring ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Shield className={`w-5 h-5 ${isMonitoring ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{isMonitoring ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-gray-500">Monitoring Status</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Container */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative aspect-video bg-gray-900">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <VideoOff className="w-16 h-16 text-gray-500 mb-4" />
                    <p className="text-gray-400">Camera not active</p>
                  </div>
                )}

                {/* Status Overlay */}
                {isMonitoring && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">LIVE</span>
                  </div>
                )}

                {/* Interval indicator */}
                {isMonitoring && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
                    <span className="text-white text-sm">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Every {config.captureIntervalSeconds}s
                    </span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">{status}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!cameraActive ? (
                    <Button onClick={startCamera} className="gap-2">
                      <Video className="w-4 h-4" />
                      Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button onClick={stopCamera} variant="outline" className="gap-2">
                        <VideoOff className="w-4 h-4" />
                        Stop Camera
                      </Button>

                      {!isMonitoring ? (
                        <Button onClick={startMonitoring} className="gap-2 bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4" />
                          Start Monitoring
                        </Button>
                      ) : (
                        <Button onClick={stopMonitoring} variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
                          <Pause className="w-4 h-4" />
                          Stop Monitoring
                        </Button>
                      )}

                      <Button onClick={triggerManualCapture} variant="outline" className="gap-2">
                        <Camera className="w-4 h-4" />
                        Manual Capture
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Settings
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-700">Capture Interval (seconds)</Label>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        value={config.captureIntervalSeconds}
                        onChange={(e) => updateConfig('captureIntervalSeconds', parseInt(e.target.value))}
                        className="w-full mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">{config.captureIntervalSeconds} seconds</p>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-700">Auto-Submit Threshold</Label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={config.autoSubmitThreshold * 100}
                        onChange={(e) => updateConfig('autoSubmitThreshold', parseInt(e.target.value) / 100)}
                        className="w-full mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">{Math.round(config.autoSubmitThreshold * 100)}% confidence</p>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-700">Manual Review Threshold</Label>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        value={config.manualReviewThreshold * 100}
                        onChange={(e) => updateConfig('manualReviewThreshold', parseInt(e.target.value) / 100)}
                        className="w-full mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">{Math.round(config.manualReviewThreshold * 100)}% confidence</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-700">Location Tracking</Label>
                      <button
                        onClick={() => updateConfig('locationTracking', !config.locationTracking)}
                        className={`w-12 h-6 rounded-full transition-colors ${config.locationTracking ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.locationTracking ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700">
                      <strong>How it works:</strong> Captures above {Math.round(config.autoSubmitThreshold * 100)}% confidence are auto-submitted.
                      Between {Math.round(config.manualReviewThreshold * 100)}%-{Math.round(config.autoSubmitThreshold * 100)}% require manual review.
                      Below {Math.round(config.manualReviewThreshold * 100)}% are discarded.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Captures List */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Captures</h3>
                {captures.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCaptures} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {pendingReviewCount > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                  <p className="text-sm text-yellow-700 font-medium">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {pendingReviewCount} capture(s) pending review
                  </p>
                </div>
              )}

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {captures.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No captures yet</p>
                    <p className="text-gray-400 text-xs mt-1">Start monitoring to capture frames</p>
                  </div>
                ) : (
                  captures.slice(0, 20).map((capture) => (
                    <motion.div
                      key={capture.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedCapture(capture)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${capture.status === 'pending-review'
                          ? 'bg-yellow-50 border-yellow-200'
                          : capture.status === 'auto-submitted'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-100'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={capture.imageData}
                          alt="Capture"
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {capture.status === 'auto-submitted' && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Auto</span>
                            )}
                            {capture.status === 'pending-review' && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Review</span>
                            )}
                            {capture.status === 'discarded' && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Discarded</span>
                            )}
                            {capture.analysis && (
                              <span className="text-xs text-gray-500">
                                {Math.round(capture.analysis.confidence * 100)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {capture.analysis?.title || 'Processing...'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(capture.timestamp), 'HH:mm:ss')}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capture Detail Modal */}
      <AnimatePresence>
        {selectedCapture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCapture(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Capture Details</h3>
                  <button onClick={() => setSelectedCapture(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <img
                  src={selectedCapture.imageData}
                  alt="Capture"
                  className="w-full rounded-2xl mb-4"
                />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {format(new Date(selectedCapture.timestamp), 'PPpp')}
                  </div>

                  {selectedCapture.location && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{selectedCapture.location.address}</span>
                    </div>
                  )}

                  {selectedCapture.analysis && (
                    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-900">AI Analysis</span>
                        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${selectedCapture.analysis.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                            selectedCapture.analysis.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                          }`}>
                          {Math.round(selectedCapture.analysis.confidence * 100)}% confidence
                        </span>
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">{selectedCapture.analysis.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedCapture.analysis.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 text-gray-900">{selectedCapture.analysis.accidentType.replace(/_/g, ' ')}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Severity:</span>
                          <span className={`ml-2 capitalize ${selectedCapture.analysis.severity === 'critical' ? 'text-red-600' :
                              selectedCapture.analysis.severity === 'high' ? 'text-orange-600' :
                                selectedCapture.analysis.severity === 'medium' ? 'text-yellow-600' :
                                  'text-green-600'
                            }`}>
                            {selectedCapture.analysis.severity}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Vehicles:</span>
                          <span className="ml-2 text-gray-900">{selectedCapture.analysis.vehiclesInvolved}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Casualties:</span>
                          <span className="ml-2 text-gray-900">{selectedCapture.analysis.estimatedCasualties}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCapture.status === 'pending-review' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => approveCapture(selectedCapture.id)}
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve & Submit
                      </Button>
                      <Button
                        onClick={() => rejectCapture(selectedCapture.id)}
                        variant="outline"
                        className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
