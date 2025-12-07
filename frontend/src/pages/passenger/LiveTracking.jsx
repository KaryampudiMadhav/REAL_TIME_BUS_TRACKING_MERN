import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Phone, AlertCircle, Navigation, CheckCircle } from "lucide-react";
import MapComponent from "../../components/MapComponent";
import { io } from "socket.io-client";
import { axiosInstance } from "../../utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";

const LiveTracking = () => {
  const { tripId } = useParams();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [eta, setEta] = useState("Calculating...");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStops, setShowStops] = useState(false);
  const [busSpeed, setBusSpeed] = useState(40); // Default speed 40km/h

  // Fetch Trip Details
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await axiosInstance.get(`/passenger/trips/${tripId}`);
        setTripData(response.data);

        // Set initial location from DB if available, else first stop
        const initialLoc = response.data.live_location?.latitude
          ? { lat: response.data.live_location.latitude, lng: response.data.live_location.longitude }
          : { lat: response.data.route_id.stops[0].latitude, lng: response.data.route_id.stops[0].longitude };

        setCurrentLocation(initialLoc);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError("Unable to load trip details.");
        setLoading(false);
      }
    };

    if (tripId) fetchTrip();
  }, [tripId]);

  // Socket.IO Connection
  useEffect(() => {
    if (!tripId) return;

    // Connect to Socket.IO server
    const newSocket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:7000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Connected to real-time tracking server");
      setIsConnected(true);
      // Join the trip room to receive live updates
      newSocket.emit("join_trip_room", tripId);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from tracking server");
      setIsConnected(false);
    });

    // Listen for real location updates from the bus
    newSocket.on("new_location", ({ location }) => {
      if (location && location.latitude && location.longitude) {
        setCurrentLocation({
          lat: location.latitude,
          lng: location.longitude,
        });

        if (location.speed) {
          setBusSpeed(location.speed);
        }
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [tripId]);


  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Logic to determine passed stops and ETA
  const { routeStops, nextStopIndex, calculatedEta } = useMemo(() => {
    if (!tripData || !currentLocation) return { routeStops: [], nextStopIndex: 0, calculatedEta: "..." };

    const stops = tripData.route_id.stops;
    let closestIndex = 0;
    let minDistance = Infinity;

    // Find the closest stop to current location
    stops.forEach((stop, index) => {
      const dist = calculateDistance(currentLocation.lat, currentLocation.lng, stop.latitude, stop.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });

    // Determine passed stops:
    // Simple Heuristic: If we are closest to index i, we assume 0 to i-1 are passed.
    // However, if we are *approaching* i, we haven't passed it.
    // If we are *leaving* i, we have passed it.
    // For simplicity: We consider stops up to closestIndex as "current vicinity", and previous as passed.
    // Refinement: if distance to closest is very small (<100m), we are AT that stop.
    // If we are further, we need to know direction. Without previous location, hard to tell direction.
    // Fallback: Assume we are "heading to" the next stop after the closest one IF the closest one is "behind" us?
    // Let's stick to: stops[0...closestIndex] are potentially passed/active. 
    // Actually, "Passed" should be strictly those we are clearly done with.
    // Let's mark stops "passed" if their index < closestIndex.

    const passedIndexLimit = closestIndex;
    const msPerMin = 60000;
    // Calculate start time based on offset or estimated from current time if we assume 'closest' is 'now'.
    // Better: assume trip started at departure_time. 
    // Or: if we have current location, we estimate ETA to next stops relative to NOW.
    // Strategy: 
    // 1. Calculate time to closest stop.
    // 2. Add offsets relative to closest stop for subsequent stops.

    let baseTime = new Date(); // Start calculation from now

    const enhancedStops = stops.map((stop, idx) => {
      let stopEta = "--";

      if (idx > passedIndexLimit) {
        // Future stops
        // Simple estimation: difference in arrival_offset_mins from closest stop
        const closestStop = stops[closestIndex];
        const minutesDiff = stop.arrival_offset_mins - closestStop.arrival_offset_mins;

        // Add simple distance based estimate if needed, but offset is safer if reliable
        // Let's us offset difference added to 'now'
        if (minutesDiff >= 0) {
          const estimatedArrival = new Date(baseTime.getTime() + minutesDiff * msPerMin);
          stopEta = estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } else if (idx === passedIndexLimit) {
        stopEta = "Arriving"; // Or Now
      } else {
        stopEta = "Passed";
      }

      return {
        name: stop.name,
        lat: stop.latitude,
        lng: stop.longitude,
        arrival_offset_mins: stop.arrival_offset_mins,
        isPassed: idx < passedIndexLimit,
        isCurrent: idx === passedIndexLimit,
        isNext: idx === passedIndexLimit + 1,
        eta: stopEta
      };
    });

    // ETA Calculation
    let etaText = "Calculating...";
    const destination = stops[stops.length - 1];
    const distanceToDest = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destination.latitude,
      destination.longitude
    );

    if (distanceToDest < 0.1) {
      etaText = "Arrived";
    } else {
      const speedKmH = busSpeed > 0 ? busSpeed : 40; // Fallback to 40km/h
      const timeInHours = distanceToDest / speedKmH;
      const hours = Math.floor(timeInHours);
      const minutes = Math.round((timeInHours - hours) * 60);

      if (hours > 0) {
        etaText = `${hours}h ${minutes}m`;
      } else {
        etaText = `${minutes} min`;
      }
    }

    return { routeStops: enhancedStops, nextStopIndex: passedIndexLimit + 1, calculatedEta: etaText };
  }, [tripData, currentLocation, busSpeed]);

  useEffect(() => {
    setEta(calculatedEta);
  }, [calculatedEta]);


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
  if (error || !tripData) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">{error || "Trip not found"}</div>;

  const busData = [{
    id: tripData.vehicle_id._id,
    busNumber: tripData.vehicle_id.bus_number,
    location: currentLocation,
    speed: busSpeed
  }];

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-100 flex flex-col pt-16">
      {/* Full Scale Map */}
      <div className="absolute inset-x-0 bottom-0 top-16 z-0">
        <MapComponent
          center={currentLocation}
          buses={busData}
          route={routeStops} // Start/End points
          tripStartTime={tripData.departure_datetime}
          className="h-full w-full"
        />
      </div>

      {/* Floating Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-20 left-0 right-0 z-20 p-4"
      >
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <Link to="/" className="glass p-3 rounded-full text-gray-700 hover:text-black hover:bg-white/80 transition-all shadow-lg active:scale-95">
            <ArrowLeft className="h-6 w-6" />
          </Link>

          <div className="glass px-6 py-2 rounded-full flex items-center gap-3 shadow-lg">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-bold text-gray-800 text-sm tracking-wide">{isConnected ? 'LIVE TRACKING' : 'CONNECTING...'}</span>
          </div>
        </div>
      </motion.div>

      {/* Floating Bottom Panel */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-0 left-0 right-0 z-20 md:bottom-6 md:left-4 md:right-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-t-[32px] md:rounded-[32px] p-4 md:p-6 shadow-2xl backdrop-blur-xl border-t border-white/50 md:border border-white/50 relative overflow-hidden max-h-[85vh] overflow-y-auto">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 relative z-10">
              {/* Bus Info */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{tripData.vehicle_id.bus_number}</h2>
                  <span className="bg-blue-100 text-blue-700 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full uppercase tracking-wider">
                    {tripData.vehicle_id.bus_type || tripData.vehicle_id.service_type || "Deluxe Express"}
                  </span>
                </div>

                {/* --- NEW: ALERT BANNER FOR ISSUES --- */}
                {tripData && tripData.issues && tripData.issues.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {tripData.issues.map((issue, idx) => (
                      <div key={idx} className={`border rounded-lg p-3 flex items-start gap-3 ${issue.is_verified ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200 animate-pulse'}`}>
                        <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${issue.is_verified ? 'text-red-600' : 'text-yellow-600'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold uppercase ${issue.is_verified ? 'text-red-700' : 'text-yellow-700'}`}>{issue.issue_type}</p>
                            {issue.is_verified && (
                              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-green-200">
                                <CheckCircle className="h-3 w-3" /> VERIFIED
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${issue.is_verified ? 'text-red-600' : 'text-yellow-700'}`}>{issue.message}</p>
                          <p className={`text-xs mt-1 ${issue.is_verified ? 'text-red-400' : 'text-yellow-500'}`}>{new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* --- END ALERT BANNER --- */}

                <div className="flex items-center gap-2 md:gap-4 text-gray-600 mb-4 text-sm md:text-base">
                  <span className="flex items-center gap-1.5 font-medium">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500"></div>
                    {tripData.route_id.origin}
                  </span>
                  <div className="h-px bg-gray-300 w-8 md:w-12 flex relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-semibold uppercase">to</div>
                  </div>
                  <span className="flex items-center gap-1.5 font-medium">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-500"></div>
                    {tripData.route_id.destination}
                  </span>
                </div>

                <div className="flex items-center justify-between md:justify-start gap-4">
                  <button
                    onClick={() => setShowStops(!showStops)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    {showStops ? "Hide Route Stops" : "View Route Stops"}
                  </button>

                  {/* Mobile Only ETA Summary to save space if needed, keeping separate blocks for now */}
                </div>
              </div>

              {/* ETA & Status */}
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <div className="flex-1 md:flex-initial bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl md:rounded-2xl p-3 md:p-4 text-white shadow-lg shadow-blue-200 min-w-[120px] md:min-w-[140px]">
                  <div className="flex items-center gap-2 mb-1 opacity-90">
                    <Clock className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Est. Arrival</span>
                  </div>
                  <div className="text-xl md:text-2xl font-bold">{eta}</div>
                  <div className="text-[10px] md:text-xs text-blue-100 mt-1">to destination</div>
                </div>

                <div className="flex-1 md:flex-initial bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm min-w-[120px] md:min-w-[140px]">
                  <div className="flex items-center gap-2 mb-1 text-gray-500">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Stop Status</span>
                  </div>
                  <div className="font-bold text-gray-900 line-clamp-1 text-sm md:text-base">
                    {nextStopIndex < routeStops.length ? `Next: ${routeStops[nextStopIndex]?.name || 'Next Stop'}` : 'Arriving'}
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Stops View */}
            <AnimatePresence>
              {showStops && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="h-px bg-gray-200 mb-6"></div>
                  <div className="relative">
                    {/* Interactive Visual Timeline */}
                    <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    <div className="space-y-4 max-h-[40vh] md:max-h-60 overflow-y-auto pr-2 custom-scrollbar pl-8">
                      {routeStops.map((stop, idx) => (
                        <div key={idx} className={`relative flex items-center justify-between p-2 md:p-3 rounded-lg transition-colors border ${stop.isPassed ? 'bg-gray-50 border-gray-100' : stop.isCurrent ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-transparent'}`}>
                          {/* Timeline Node */}
                          <div className={`absolute -left-[27px] w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 ${stop.isPassed ? 'bg-green-500 border-green-500' : stop.isCurrent ? 'bg-white border-blue-500 animate-pulse' : 'bg-white border-gray-300'}`}>
                            {stop.isPassed && <CheckCircle className="w-3 h-3 text-white" />}
                            {stop.isCurrent && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                          </div>

                          <div className="flex items-center gap-3 flex-1 justify-between">
                            <span className={`text-sm font-medium ${stop.isPassed ? 'text-gray-400 line-through' : stop.isCurrent ? 'text-blue-700 font-bold' : 'text-gray-700'}`}>
                              {stop.name}
                            </span>
                            <span className="text-[10px] md:text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                              {stop.eta}
                            </span>
                          </div>

                          {/* Optional: Show time if available */}
                          {stop.isCurrent && (
                            <span className="hidden md:inline-block text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wide ml-2">
                              Current
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveTracking;
