import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Phone, Shield, Zap, Users, ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReportForm from '@/components/forms/ReportForm';

export default function Home() {
  const [showReportDialog, setShowReportDialog] = useState(false);

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Detection',
      description: 'Smart CCTV cameras with AI instantly detect accidents in real-time',
      color: 'bg-blue-500',
    },
    {
      icon: MapPin,
      title: 'Precise Location',
      description: 'DigiPin technology provides exact coordinates for faster response',
      color: 'bg-green-500',
    },
    {
      icon: Shield,
      title: 'Priority Response',
      description: 'AI ranks incidents by severity ensuring critical cases get immediate attention',
      color: 'bg-purple-500',
    },
    {
      icon: Users,
      title: 'Community Reports',
      description: 'Citizens can report accidents, strengthening the safety network',
      color: 'bg-orange-500',
    },
  ];

  const stats = [
    { value: '< 3min', label: 'Avg. Response Time' },
    { value: '10K+', label: 'Incidents Tracked' },
    { value: '500+', label: 'Hotspots Mapped' },
    { value: '95%', label: 'Resolution Rate' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920')] opacity-10 bg-cover bg-center" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live Monitoring Active
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Saving Lives Through
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Faster Response
                </span>
              </h1>
              
              <p className="text-lg text-blue-100 mb-8 max-w-lg">
                AI-powered accident detection and emergency response platform. 
                Report incidents, track hotspots, and help save lives in your community.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => setShowReportDialog(true)}
                  className="h-14 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Report an Accident
                </Button>
                
                <Link to={createPageUrl('Hotspots')}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 rounded-full bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold backdrop-blur-sm"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    View Hotspots
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl opacity-20 blur-2xl" />
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Live Alert</h4>
                      <p className="text-blue-200 text-sm">Accident detected on NH-44</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-white font-medium">AI Detection</p>
                        <p className="text-blue-200 text-xs">Vehicle collision identified</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-300" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Responders Dispatched</p>
                        <p className="text-blue-200 text-xs">ETA: 4 minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How Pahal Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A comprehensive platform combining AI technology with community involvement
            to create a safer environment for everyone.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-8 lg:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=1920')] opacity-10 bg-cover bg-center" />
          
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Phone className="w-10 h-10" />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              In Case of Emergency
            </h2>
            <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">
              If you witness an accident, report it immediately. Your quick action can help save lives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowReportDialog(true)}
                className="h-14 px-8 rounded-full bg-white text-red-600 hover:bg-red-50 font-semibold shadow-lg"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Report Now
              </Button>
              
              <a href="tel:112">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 rounded-full border-2 border-white/50 text-white hover:bg-white/10 font-semibold"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call 112
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Report an Accident
            </DialogTitle>
          </DialogHeader>
          <ReportForm 
            onSuccess={() => setShowReportDialog(false)} 
            onCancel={() => setShowReportDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}