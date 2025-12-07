import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Square,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  LogOut,
  AlertCircle,
  Loader,
  Navigation
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import VoiceSearch from "../../components/VoiceSearch";
import { gpsService } from "../../utils/gpsService.js";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { axiosInstance } from "../../utils/axiosInstance";

// Setup custom icons
const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const DriverDashboard = () => {
  const [user] = useState({ name: "Driver User", role: "driver" });
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripStatus, setTripStatus] = useState("scheduled");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ type: "", description: "" });
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [gpsError, setGpsError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Socket and Fetch Trip
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:7000");
    setSocket(newSocket);

    fetchCurrentTrip();

    return () => newSocket.disconnect();
  }, []);

  const fetchCurrentTrip = async () => {
    try {
      // Fetch the assigned trip for today
      const response = await axiosInstance.get("/driver/my-current-trip"); // Needs backend endpoint
      if (response.data) {
        setActiveTrip(response.data);
        setTripStatus(response.data.status === "ON_TRIP" ? "in_transit" : "scheduled");
      }
      setLoading(false);
    } catch (error) {
      console.log("No active trip found or error fetching", error);
      // Fallback or just set loading false
      setLoading(false);
    }
  };

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    setGpsStatus("loading");

    try {
      await gpsService.startTracking({ enableHighAccuracy: true });

      // Update backend status
      await axiosInstance.put(`/driver/trip/${activeTrip._id}/start`);

      gpsService.onLocationUpdate((position) => {
        const { latitude, longitude, accuracy } = position;
        setCurrentLocation({ latitude, longitude, accuracy });

        const speedKmh = gpsService.getSpeedKmh();
        if (speedKmh !== null) setCurrentSpeed(Math.round(speedKmh));

        if (socket) {
          socket.emit("driver_location_update", {
            tripId: activeTrip._id,
            location: { latitude, longitude },
            speed: speedKmh
          });
        }
      });

      setGpsStatus("tracking");
      setTripStatus("in_transit");
      toast.success("Trip Started & Tracking Active");

    } catch (error) {
      setGpsStatus("error");
      setGpsError(error.message);
      toast.error("GPS Start Failed");
    }
  };

  const handleEndTrip = async () => {
    gpsService.stopTracking();
    setGpsStatus("idle");
    try {
      await axiosInstance.put(`/driver/trip/${activeTrip._id}/end`);
      setTripStatus("completed");
      toast.success("Trip Completed");
    } catch (error) {
      toast.error("Failed to end trip");
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/driver/issues", {
        tripId: activeTrip?._id,
        type: issueForm.type,
        description: issueForm.description,
        location: currentLocation
      });
      toast.success("Issue Reported");
      setShowIssueModal(false);
      setIssueForm({ type: "", description: "" });
    } catch (error) {
      toast.error("Failed to report issue");
    }
  };

  const issueTypes = [
    { value: "breakdown", label: "Vehicle Breakdown" },
    { value: "traffic", label: "Heavy Traffic" },
    { value: "tire_puncture", label: "Tire Puncture" },
    { value: "medical_emergency", label: "Medical Emergency" },
    { value: "other", label: "Other" },
  ];

  if (loading) return <div className="flex h-screen justify-center items-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Driver Console</h1>
          <p className="text-xs text-gray-500">{activeTrip ? activeTrip.vehicle_id.bus_number : "No Trip"}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${gpsStatus === "tracking" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {gpsStatus === "tracking" ? "GPS LIVE" : "GPS OFF"}
        </div>
      </div>

      {/* Map View */}
      <div className="h-[40vh] w-full bg-gray-200 relative z-0">
        <MapContainer
          center={currentLocation ? [currentLocation.latitude, currentLocation.longitude] : [17.3850, 78.4867]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {activeTrip && activeTrip.route_id.stops && (
            <Polyline
              positions={activeTrip.route_id.stops.map(s => [s.lat, s.lng])}
              color="#3B82F6"
              weight={5}
            />
          )}

          {currentLocation && (
            <>
              <Marker position={[currentLocation.latitude, currentLocation.longitude]} icon={busIcon} />
              <RecenterMap center={[currentLocation.latitude, currentLocation.longitude]} />
            </>
          )}
        </MapContainer>

        {/* Speed Overlay */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow border border-gray-200 z-[400]">
          <span className="block text-2xl font-bold text-center">{currentSpeed}</span>
          <span className="text-xs text-gray-500">km/h</span>
        </div>
      </div>

      {/* Controls Area */}
      <div className="p-4 space-y-4">
        {/* Trip Info */}
        {activeTrip ? (
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-gray-700">
              <Navigation className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">{activeTrip.route_id.origin} ➝ {activeTrip.route_id.destination}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 pl-7">
              <span>Dep: {new Date(activeTrip.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>Stops: {activeTrip.route_id.stops.length}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl text-center text-gray-500">
            No active trip assignment found for today.
          </div>
        )}

        {/* Action Buttons */}
        {activeTrip && (
          <div className="grid grid-cols-2 gap-4">
            {tripStatus === "scheduled" ? (
              <button
                onClick={handleStartTrip}
                className="col-span-2 bg-green-600 text-white font-bold py-4 rounded-xl shadow hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Play className="h-6 w-6" />
                <span>Start Route</span>
              </button>
            ) : tripStatus === "in_transit" ? (
              <button
                onClick={handleEndTrip}
                className="col-span-2 bg-red-600 text-white font-bold py-4 rounded-xl shadow hover:bg-red-700 flex items-center justify-center space-x-2"
              >
                <Square className="h-6 w-6" />
                <span>End Route</span>
              </button>
            ) : (
              <div className="col-span-2 text-center text-green-600 font-bold py-2 bg-green-50 rounded-lg">Route Completed</div>
            )}

            <button
              onClick={() => setShowIssueModal(true)}
              className="bg-orange-100 text-orange-700 font-semibold py-3 rounded-xl hover:bg-orange-200 flex flex-col items-center justify-center"
            >
              <AlertTriangle className="h-6 w-6 mb-1" />
              <span>Report Issue</span>
            </button>

            <div className="bg-blue-100 text-blue-700 font-semibold py-3 rounded-xl flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{activeTrip.booked_seats.length}</span>
              <span className="text-xs">Passengers</span>
            </div>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-6 animate-slide-up">
            <h2 className="text-lg font-bold mb-4">Report Issue</h2>
            <form onSubmit={handleReportIssue} className="space-y-4">
              <select
                className="w-full p-2 border rounded-lg"
                value={issueForm.type}
                onChange={e => setIssueForm({ ...issueForm, type: e.target.value })}
              >
                <option value="">Select Issue Type</option>
                {issueTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <textarea
                className="w-full p-2 border rounded-lg"
                rows="3"
                placeholder="Description..."
                value={issueForm.description}
                onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
              ></textarea>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowIssueModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-orange-600 text-white rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
