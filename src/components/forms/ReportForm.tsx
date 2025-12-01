import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, MapPin, Loader2, Camera, X, Sparkles, CheckCircle, Phone, User, Brain, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Label } from '../ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select'
import { generateDigiPin } from '../../lib/utils'
import { analyzeAccidentImage, AccidentAnalysis } from '../../lib/perplexityService'
import { incidentsApi, incidentMediaApi } from '../../lib/api'
import type { IncidentInsert } from '../../lib/database.types'

const accidentTypes = [
  { value: 'vehicle_collision', label: 'Vehicle Collision' },
  { value: 'pedestrian_hit', label: 'Pedestrian Hit' },
  { value: 'motorcycle_accident', label: 'Motorcycle Accident' },
  { value: 'truck_accident', label: 'Truck Accident' },
  { value: 'multi_vehicle', label: 'Multi-Vehicle Pileup' },
  { value: 'hit_and_run', label: 'Hit and Run' },
  { value: 'other', label: 'Other' },
]

const severityOptions = [
  { value: 'low', label: 'Low - Minor damage, no injuries', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: 'Medium - Some injuries', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High - Serious injuries', color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critical - Life threatening', color: 'bg-red-100 text-red-700' },
]

interface ReportFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReportForm({ onSuccess, onCancel }: ReportFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    accident_type: '',
    severity: 'medium',
    reporter_name: '',
    reporter_phone: '',
    address: '',
    latitude: 0,
    longitude: 0,
  })

  const [photos, setPhotos] = useState<string[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AccidentAnalysis | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    getLocation()
  }, [])

  const getLocation = () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }))
          // Try to get address from coordinates using OpenStreetMap Nominatim
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            )
            const data = await response.json()
            if (data.display_name) {
              setFormData((prev) => ({ ...prev, address: data.display_name }))
            }
          } catch (e) {
            console.log('Could not fetch address')
          }
          setLocationLoading(false)
        },
        () => {
          setLocationLoading(false)
        }
      )
    } else {
      setLocationLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setIsAnalyzing(true)
    setAnalysisError(null)

    // Store files and create preview URLs
    const newFiles: File[] = []
    const uploadedUrls: string[] = []
    
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file)
      uploadedUrls.push(url)
      newFiles.push(file)
    }

    setPhotos((prev) => [...prev, ...uploadedUrls])
    setPhotoFiles((prev) => [...prev, ...newFiles])

    // Analyze first image with Perplexity AI
    if (newFiles.length > 0) {
      try {
        const analysis = await analyzeAccidentImage(newFiles[0])
        setAiAnalysis(analysis)
        
        // Auto-fill form fields based on AI analysis
        setFormData((prev) => ({
          ...prev,
          accident_type: analysis.accidentType,
          severity: analysis.severity,
          title: analysis.title,
          description: prev.description || analysis.description,
        }))
      } catch (error) {
        console.error('AI analysis failed:', error)
        setAnalysisError('AI analysis failed. Please fill in the details manually.')
      }
    }

    setIsAnalyzing(false)
    setIsUploading(false)
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
    if (photos.length === 1) {
      setAiAnalysis(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate DigiPin
      const digipin = generateDigiPin(formData.latitude, formData.longitude)

      // Prepare incident data
      const incidentData: IncidentInsert = {
        title: formData.title || `${formData.accident_type.replace('_', ' ')} Report`,
        description: formData.description,
        accident_type: formData.accident_type as any,
        severity: formData.severity as any,
        status: 'reported',
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        digipin: digipin,
        source: 'citizen_app',
        ai_confidence: aiAnalysis?.confidence || null,
        ai_analysis: aiAnalysis ? JSON.stringify(aiAnalysis) : null,
        is_ai_verified: !!aiAnalysis,
        vehicles_involved: aiAnalysis?.vehiclesInvolved || 1,
        estimated_casualties: aiAnalysis?.estimatedCasualties || 0,
      }

      console.log('Creating incident...', incidentData)
      // Create incident in database
      const createdIncident = await incidentsApi.create(incidentData)
      console.log('Incident created:', createdIncident.id)

      // Upload photos if any (don't fail if upload fails)
      let uploadedCount = 0
      if (photoFiles.length > 0) {
        console.log('Uploading', photoFiles.length, 'photos...')
        try {
          const uploadPromises = photoFiles.map((file, index) => 
            incidentMediaApi.upload(createdIncident.id, file, index === 0)
              .then(result => {
                if (result) {
                  console.log('Photo uploaded:', result)
                  uploadedCount++
                }
                return result
              })
              .catch(err => {
                console.error('Photo upload failed:', err)
                return null
              })
          )
          
          await Promise.all(uploadPromises)
          console.log(`${uploadedCount}/${photoFiles.length} photos uploaded successfully`)
          
          if (uploadedCount === 0 && photoFiles.length > 0) {
            console.warn('All photo uploads failed - check storage bucket setup')
          }
        } catch (err) {
          console.error('Photo upload error:', err)
          // Continue anyway - incident is saved
        }
      }

      setSubmitted(true)
      setIsSubmitting(false)

      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (error) {
      console.error('Failed to submit report:', error)
      alert('Failed to submit report. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
        <p className="text-gray-600 mb-4">
          Thank you for helping keep our community safe.
        </p>
        <p className="text-sm text-gray-500">
          Emergency services have been notified and will respond shortly.
        </p>
        {formData.latitude && formData.longitude && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl inline-block">
            <p className="text-sm font-mono text-blue-700">
              DigiPin: {generateDigiPin(formData.latitude, formData.longitude)}
            </p>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <motion.div
              animate={{
                scale: step === s ? 1.1 : 1,
                backgroundColor: step >= s ? '#3b82f6' : '#e5e7eb',
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ color: step >= s ? 'white' : '#6b7280' }}
            >
              {s}
            </motion.div>
            {s < 3 && (
              <div
                className={`w-12 h-1 rounded-full transition-colors ${
                  step > s ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upload Evidence</h3>
              <p className="text-sm text-gray-500">
                Add photos of the accident for AI analysis
              </p>
            </div>

            {/* Photo Upload */}
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={isUploading}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                      <p className="text-blue-600 font-medium">
                        {isAnalyzing ? 'AI Analyzing image...' : 'Uploading...'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <Camera className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium mb-1">
                        Click to upload photos
                      </p>
                      <p className="text-sm text-gray-400">or drag and drop</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Photo Preview */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((url, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl"
                >
                  <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-purple-700">
                      Perplexity AI analyzing image...
                    </p>
                    <p className="text-xs text-purple-500">
                      Detecting accident type, severity, and details
                    </p>
                  </div>
                </motion.div>
              )}

              {analysisError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm text-yellow-700">{analysisError}</p>
                </motion.div>
              )}

              {aiAnalysis && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-700">AI Analysis Complete</span>
                    <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                      {Math.round(aiAnalysis.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {aiAnalysis.accidentType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Severity:</span>
                      <span className={`ml-2 font-medium capitalize ${
                        aiAnalysis.severity === 'critical' ? 'text-red-600' :
                        aiAnalysis.severity === 'high' ? 'text-orange-600' :
                        aiAnalysis.severity === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {aiAnalysis.severity}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Vehicles:</span>
                      <span className="ml-2 font-medium text-gray-900">{aiAnalysis.vehiclesInvolved}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Est. Casualties:</span>
                      <span className="ml-2 font-medium text-gray-900">{aiAnalysis.estimatedCasualties}</span>
                    </div>
                  </div>

                  {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-100">
                      <span className="text-xs font-medium text-purple-600 uppercase">Recommendations:</span>
                      <ul className="mt-1 space-y-1">
                        {aiAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                            <span className="text-purple-500">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <Button
              type="button"
              onClick={() => setStep(2)}
              className="w-full h-12"
              disabled={photos.length === 0}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Incident Details</h3>
              <p className="text-sm text-gray-500">
                Provide information about the accident
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Fetching location..."
                  className="pl-10"
                  disabled={locationLoading}
                />
                {locationLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                )}
              </div>
              {formData.latitude && formData.longitude && (
                <p className="text-xs text-gray-400 font-mono">
                  DigiPin: {generateDigiPin(formData.latitude, formData.longitude)}
                </p>
              )}
            </div>

            {/* Accident Type */}
            <div className="space-y-2">
              <Label>Accident Type</Label>
              <Select
                value={formData.accident_type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, accident_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {accidentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label>Severity Level</Label>
              <div className="grid grid-cols-2 gap-2">
                {severityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, severity: option.value }))
                    }
                    className={`p-3 rounded-xl text-left transition-all ${
                      formData.severity === option.value
                        ? `${option.color} ring-2 ring-offset-2 ring-current`
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <p className="font-medium text-sm">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe what happened..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-12"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 h-12"
                disabled={!formData.accident_type}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Information</h3>
              <p className="text-sm text-gray-500">
                Optional - for follow-up and gratitude
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Name (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={formData.reporter_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, reporter_name: e.target.value }))
                    }
                    placeholder="Enter your name"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.reporter_phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, reporter_phone: e.target.value }))
                    }
                    placeholder="+91 98765 43210"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  We'll send you a thank you message and updates about the incident
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-medium text-blue-900 mb-2">Report Summary</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>📍 {formData.address || 'Location pending'}</p>
                <p>🚗 {accidentTypes.find((t) => t.value === formData.accident_type)?.label}</p>
                <p>⚠️ {severityOptions.find((s) => s.value === formData.severity)?.label}</p>
                <p>📷 {photos.length} photo(s) attached</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 h-12"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="flex-1 h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}
