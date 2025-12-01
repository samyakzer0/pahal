import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, MapPin, Loader2, Camera, X, Sparkles, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const accidentTypes = [
  { value: 'vehicle_collision', label: 'Vehicle Collision' },
  { value: 'pedestrian_hit', label: 'Pedestrian Hit' },
  { value: 'motorcycle_accident', label: 'Motorcycle Accident' },
  { value: 'truck_accident', label: 'Truck Accident' },
  { value: 'multi_vehicle', label: 'Multi-Vehicle Pileup' },
  { value: 'hit_and_run', label: 'Hit and Run' },
  { value: 'other', label: 'Other' },
];

const severityOptions = [
  { value: 'low', label: 'Low - Minor damage, no injuries' },
  { value: 'medium', label: 'Medium - Some injuries' },
  { value: 'high', label: 'High - Serious injuries' },
  { value: 'critical', label: 'Critical - Life threatening' },
];

export default function ReportForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    accident_type: '',
    severity: 'medium',
    reporter_name: '',
    reporter_phone: '',
    address: '',
    latitude: null,
    longitude: null,
  });
  
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          // Try to get address from coordinates
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await response.json();
            if (data.display_name) {
              setFormData(prev => ({ ...prev, address: data.display_name }));
            }
          } catch (e) {
            console.log('Could not fetch address');
          }
          setLocationLoading(false);
        },
        () => {
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(result.file_url);
    }
    
    setPhotos(prev => [...prev, ...uploadedUrls]);
    setIsUploading(false);
    
    // Analyze first photo with AI if it's the first upload
    if (photos.length === 0 && uploadedUrls.length > 0) {
      analyzeWithAI(uploadedUrls[0]);
    }
  };

  const analyzeWithAI = async (photoUrl) => {
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this accident scene photo and extract the following information. Be concise and accurate.`,
        file_urls: [photoUrl],
        response_json_schema: {
          type: 'object',
          properties: {
            accident_type: { 
              type: 'string', 
              enum: ['vehicle_collision', 'pedestrian_hit', 'motorcycle_accident', 'truck_accident', 'multi_vehicle', 'hit_and_run', 'other']
            },
            severity: { 
              type: 'string', 
              enum: ['low', 'medium', 'high', 'critical']
            },
            description: { type: 'string' },
            vehicles_involved: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      
      if (result) {
        setFormData(prev => ({
          ...prev,
          accident_type: result.accident_type || prev.accident_type,
          severity: result.severity || prev.severity,
          description: result.description || prev.description,
        }));
      }
    } catch (e) {
      console.log('AI analysis failed');
    }
    setIsAnalyzing(false);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const incidentData = {
      ...formData,
      photo_urls: photos,
      report_count: 1,
      is_ai_detected: false,
    };
    
    await base44.entities.Incident.create(incidentData);
    setSubmitted(true);
    setTimeout(() => {
      onSuccess?.();
    }, 2000);
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
        <p className="text-gray-600 max-w-sm">
          Thank you for reporting. Emergency services have been notified and help is on the way.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Photos of the Scene *
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Add Photo</span>
              </>
            )}
          </label>
        </div>
        
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>AI is analyzing the scene...</span>
          </motion.div>
        )}
      </div>

      {/* Location */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Location
        </Label>
        <div className="relative">
          <Input
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter location or use GPS"
            className="pl-10 h-12 rounded-xl"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {locationLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
          )}
        </div>
        {formData.latitude && formData.longitude && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            GPS coordinates captured
          </p>
        )}
      </div>

      {/* Accident Type & Severity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Accident Type *
          </Label>
          <Select
            value={formData.accident_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, accident_type: value }))}
          >
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {accidentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Severity *
          </Label>
          <Select
            value={formData.severity}
            onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
          >
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              {severityOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Description
        </Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what you see..."
          className="min-h-[100px] rounded-xl resize-none"
        />
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Your Name
          </Label>
          <Input
            value={formData.reporter_name}
            onChange={(e) => setFormData(prev => ({ ...prev, reporter_name: e.target.value }))}
            placeholder="Optional"
            className="h-12 rounded-xl"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Phone Number
          </Label>
          <Input
            value={formData.reporter_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, reporter_phone: e.target.value }))}
            placeholder="For updates"
            className="h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.accident_type || photos.length === 0}
          className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Report'
          )}
        </Button>
      </div>
    </form>
  );
}