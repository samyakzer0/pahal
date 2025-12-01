# Pahal - Accident Monitoring & First Responder Platform

<div align="center">
  <img src="public/pahal-logo.svg" alt="Pahal Logo" width="80" />
  <h3>AI-Powered Emergency Response System</h3>
  <p>Saving Lives Through Faster Response</p>
</div>

---

## 🚀 Overview

Pahal is a comprehensive accident monitoring and first responder platform that combines AI-powered detection with community reporting to enable faster emergency responses. The platform features:

- **Real-time AI Detection**: Smart CCTV cameras with AI models detect accidents automatically
- **DigiPin Integration**: Precise location pinning for accurate responder dispatch
- **Community Reporting**: Citizens can report accidents with photo/video uploads
- **Priority Management**: AI ranks incidents by severity for optimal resource allocation
- **Interactive Hotspot Map**: Visual representation of accident-prone zones

## ✨ Features

### For Citizens
- 📱 Easy accident reporting with photo/video upload
- 🤖 AI-assisted form filling based on uploaded images
- 📍 Automatic geolocation detection
- 🔥 Real-time hotspot visualization

### For Administrators
- 🎛️ Comprehensive command center dashboard
- 📊 Real-time incident feed with filtering
- 👥 Responder management and dispatch
- 📈 Analytics and response metrics
- 🗺️ Interactive map with hotspots

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: TanStack React Query
- **Maps**: React Leaflet + OpenStreetMap
- **Charts**: Recharts
- **UI Components**: Radix UI
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd pahal1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 🗂️ Project Structure

```
pahal1/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── forms/          # Form components (ReportForm)
│   │   ├── incident/       # Incident-related components
│   │   ├── map/            # Map components (HotspotMap)
│   │   └── ui/             # Base UI components
│   ├── lib/                # Utilities and mock data
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page with reporting
│   │   ├── Hotspots.tsx    # Hotspot map view
│   │   ├── AdminDashboard.tsx  # Admin command center
│   │   ├── Analytics.tsx   # Analytics dashboard
│   │   └── Login.tsx       # Admin login
│   ├── App.tsx             # App routes
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Design Principles

- **Minimalist & Clean**: Clear visual hierarchy with rounded card designs
- **Purposeful Animations**: Smooth transitions that enhance user experience
- **Urgent Color Palette**: Blues for trust, red for critical alerts
- **Responsive Design**: Works on mobile and desktop
- **Accessibility**: Compliant with screen readers and keyboard navigation

## 📱 Pages

### Home (`/`)
Landing page with:
- Hero section with statistics
- "Report an Accident" CTA
- Feature highlights
- How it works section

### Hotspots (`/hotspots`)
- Interactive map showing accident hotspots
- Filter by severity and type
- Incident list with details

### Admin Dashboard (`/admin`)
- Real-time incident feed
- Status updates and priority management
- Responder tracking
- Quick actions

### Analytics (`/analytics`)
- Incident trends over time
- Severity distribution
- Response time metrics
- Top hotspot analysis

## 🔐 Demo Access

For demo purposes, the admin login accepts any email/password combination.

## 📄 License

MIT License - Feel free to use this project for your own purposes.

---

<div align="center">
  Made with ❤️ for public safety
</div>
