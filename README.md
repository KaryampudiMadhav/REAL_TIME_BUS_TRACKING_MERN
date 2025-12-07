# BusTracker Pro

> **A Next-Generation Real-Time Bus Tracking & Booking System**

**BusTracker Pro** is a comprehensive solution designed to modernize the public transport experience. It bridges the gap between passengers, conductors, and administrators with a seamless, real-time platform.

---

## 🚀 Key Features

### 🌍 For Passengers
- **Live Tracking**: Real-time bus location updates on an interactive map.
- **Smart Booking**: Easy seat selection and ticket booking with dynamic pricing.
- **Voice Search**: Hands-free route searching for accessibility.
- **Instant Alerts**: Notifications for delays, arrivals, and conductor announcements.
- **Mobile Responsive**: Fully optimized experience for all devices.

### 👮 For Conductors
- **Trip Management**: Start/Stop trips and manage passenger manifests.
- **Issue Reporting**: Instantly report breakdowns, traffic, or other issues.
- **QR Validation**: Quick ticket scanning and validation.

### 🛡️ For Administrators
- **Fleet Overview**: Monitor all buses, routes, and active trips live.
- **Staff Management**: Manage conductors, drivers, and schedules.
- **Analytics**: Data-driven insights on route performance and revenue.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-Time**: Socket.IO
- **Maps**: Leaflet / Mapbox Integration
- **State Management**: Zustand

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Bus_tracking
```

### 2. Install Dependencies
You need to install dependencies for both the **Backend** and **Frontend**.

**Backend Setup:**
```bash
cd backend
npm install
# Create .env file with your credentials (MONGO_URI, JWT_SECRET, etc.)
npm start
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=7000
mongoURI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Create a `.env` file in the `frontend` directory:
```env
VITE_SERVER_URL=http://localhost:7000
```

---

## 🚀 Deployment Guide

### Frontend (Vercel)
1.  Navigate to `frontend`.
2.  Run `npm run build` to generate the `dist` folder.
3.  Deploy the `dist` folder to your hosting provider.

### Backend (Render)
1.  Connect your repository.
2.  Set the Root Directory to `backend` (or ensure the start script points there).
3.  Add your Environment Variables in the provider's dashboard.
4.  Command: `npm start`.


## 📄 License
This project is licensed under the MIT License.

---
**Built with ❤️ for Better Commutes.**
