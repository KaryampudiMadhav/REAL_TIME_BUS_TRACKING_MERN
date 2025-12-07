import React, { useState, useEffect } from "react";
import {
    Users,
    MapPin,
    AlertTriangle,
    LogOut,
    Search,
    UserCheck,
    QrCode,
    Banknote,
    Navigation,
    Bus,
    Calendar,
    Clock,
    ChevronRight,
    Loader
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { gpsService } from "../../utils/gpsService";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import QrReader from "react-qr-scanner";

const ConductorDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("trips"); // trips, scan, offline, issues
    const [myTrips, setMyTrips] = useState([]);
    const [currentTrip, setCurrentTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingIdInput, setBookingIdInput] = useState("");
    const [verificationResult, setVerificationResult] = useState(null);
    const [passengers, setPassengers] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState("");
    const [offlineDetails, setOfflineDetails] = useState({ name: "", phone: "" });

    // Issue Reporting State
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [issueForm, setIssueForm] = useState({ type: "", description: "" });
    const issueTypes = [
        { value: "breakdown", label: "Vehicle Breakdown" },
        { value: "traffic", label: "Heavy Traffic" },
        { value: "medical_emergency", label: "Medical Emergency" },
        { value: "accident", label: "Accident" },
        { value: "other", label: "Other" },
    ];

    // Tracking State
    const [isTracking, setIsTracking] = useState(false);
    const [socket, setSocket] = useState(null);
    const [locationStats, setLocationStats] = useState({ lat: null, lng: null, speed: null, accuracy: null });

    // Initialize Socket
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:7000");
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, []);

    // 1. Fetch Trips on Load
    useEffect(() => {
        fetchMyTrips();
    }, []);

    const fetchMyTrips = async () => {
        try {
            const response = await axiosInstance.get("/conductor/my-trips");
            setMyTrips(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching trips:", error);
            if (error.response?.status === 403) {
                toast.error("Access Forbidden. Please Login Again.");
                navigate("/conductor/login"); // Redirect to login on 403
            } else {
                toast.error("Failed to load trips.");
            }
            setLoading(false);
        }
    };

    const startTripManagement = async (trip) => {
        setCurrentTrip(trip);
        setActiveTab("passengers");
        try {
            const response = await axiosInstance.get(`/conductor/trip/${trip._id}/passengers`);
            setPassengers(response.data.passengers || response.data || []);
        } catch (error) {
            console.error("Error fetching passengers:", error);
        }
    };

    // 2. Verify Ticket Logic
    const handleVerifyTicket = async (e) => {
        e.preventDefault();
        if (!bookingIdInput) return;

        try {
            setVerificationResult(null);
            const response = await axiosInstance.get(`/conductor/verify-booking/${bookingIdInput}`);
            setVerificationResult({
                success: true,
                message: "Valid Ticket",
                data: response.data?.booking || response.data
            });
            toast.success("Ticket Verified!");
        } catch (error) {
            setVerificationResult({
                success: false,
                message: error.response?.data?.message || "Invalid or Expired Ticket"
            });
            toast.error("Verification Failed");
        }
    };

    // 3. Offline Booking Logic
    const handleOfflineBooking = async (e) => {
        e.preventDefault();
        if (!currentTrip) {
            toast.error("Please select a trip first.");
            return;
        }
        try {
            await axiosInstance.post("/conductor/bookings/offline", {
                trip_id: currentTrip._id,
                seat_numbers: selectedSeat ? [selectedSeat] : [],
                ticketCount: selectedSeat ? 0 : 1, // Logic for seat vs count
                passengerName: offlineDetails.name,
                passengerPhone: offlineDetails.phone,
            });
            toast.success("Offline Booking Created!");
            setOfflineDetails({ name: "", phone: "" });
            setSelectedSeat("");
            // Refresh passengers
            startTripManagement(currentTrip);
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking Failed");
        }
    };

    // 4. Issue Reporting Logic
    const handleReportIssue = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post("/conductor/issues", {
                trip_id: currentTrip?._id,
                issue_type: issueForm.type,
                message: issueForm.description,
                reportedBy: "Conductor"
            });
            toast.success("Issue Reported Successfully");
            setShowIssueModal(false);
            setIssueForm({ type: "", description: "" });
        } catch (error) {
            console.error("Issue report error:", error);
            toast.error("Failed to report issue");
        }
    };

    // 5. GPS Tracking Logic
    const handleStartTracking = async () => {
        if (!currentTrip) return;
        // Stop simulation if running
        if (isSimulating) {
            setIsSimulating(false);
            if (window.simulationInterval) clearInterval(window.simulationInterval);
            toast("Simulation stopped for real GPS.");
        }

        try {
            // Try High Accuracy first with 30s timeout
            await gpsService.startTracking({ enableHighAccuracy: true, timeout: 30000 });

            gpsService.onLocationUpdate((position) => {
                const { latitude, longitude, accuracy } = position;
                const speedKmh = gpsService.getSpeedKmh();

                if (socket) {
                    // Update local stats UI
                    setLocationStats({ lat: latitude, lng: longitude, speed: speedKmh, accuracy });

                    socket.emit("driver_location_update", {
                        tripId: currentTrip._id,
                        location: { latitude, longitude },
                        speed: speedKmh
                    });
                }
            });
            setIsTracking(true);
            toast.success("Live Tracking Started (High Accuracy)");
        } catch (error) {
            console.warn("High Accuracy GPS failed, trying low accuracy...", error);

            // Fallback: Try Low Accuracy (likely IP-based)
            try {
                await gpsService.startTracking({ enableHighAccuracy: false, timeout: 30000 });

                gpsService.onLocationUpdate((position) => {
                    const { latitude, longitude, accuracy } = position;
                    const speedKmh = gpsService.getSpeedKmh();

                    if (socket) {
                        setLocationStats({ lat: latitude, lng: longitude, speed: speedKmh, accuracy });
                        socket.emit("driver_location_update", {
                            tripId: currentTrip._id,
                            location: { latitude, longitude },
                            speed: speedKmh
                        });
                    }
                });

                setIsTracking(true);
                toast.success("Live Tracking Started (Low Accuracy Mode)");
            } catch (fallbackError) {
                console.error("GPS Start Error:", fallbackError);
                toast.error(fallbackError.message || "Failed to start GPS");
            }
        }
    };

    const handleStopTracking = () => {
        gpsService.stopTracking();
        setIsTracking(false);
        toast.success("Live Tracking Stopped");
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/staff/logout");
        } catch (error) {
            console.error("Logout failed", error);
        }
        localStorage.removeItem("token");
        navigate("/conductor/login");
    };

    // 6. Auto-Prompt Location Logic
    const [showLocationModal, setShowLocationModal] = useState(false);

    useEffect(() => {
        if (currentTrip && !isTracking) {
            setShowLocationModal(true);
        }
    }, [currentTrip, isTracking]);

    // 7. Trip Status Management
    const handleUpdateTripStatus = async (newStatus) => {
        if (!currentTrip) return;
        try {
            await axiosInstance.put(`/conductor/trip/${currentTrip._id}/status`, { status: newStatus });

            // Update local state
            const updatedTrip = { ...currentTrip, status: newStatus };
            setCurrentTrip(updatedTrip);

            // Update list state
            setMyTrips(prev => prev.map(t => t._id === currentTrip._id ? updatedTrip : t));

            toast.success(`Trip ${newStatus === "IN_TRANSIT" ? "Started" : "Ended"} Successfully`);

            // Auto-start GPS if trip started
            if (newStatus === "IN_TRANSIT") {
                handleStartTracking();
            } else if (newStatus === "COMPLETED") {
                handleStopTracking();
            }
        } catch (error) {
            toast.error("Failed to update trip status");
        }
    };

    // 8. Simulation Logic (For Testing)
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulateTrip = () => {
        if (!currentTrip || !socket) return;
        if (isSimulating) {
            setIsSimulating(false);
            return;
        }

        // Stop GPS if running
        if (isTracking) {
            handleStopTracking();
            toast("GPS stopped for Simulation.");
        }

        setIsSimulating(true);
        toast.success("Simulation Started: Bus will move along the route.");

        const stops = currentTrip.route_id?.stops || [];
        if (stops.length < 2) {
            toast.error("Not enough stops to simulate.");
            return;
        }

        let currentStopIndex = 0;
        let progress = 0; // 0 to 1 between stops

        const simulationInterval = setInterval(() => {
            if (!isSimulating) { // this check might fail inside closure due to stale closure, rely on ref or cleanup
                // Manual stop logic handled by clearing interval outside
            }

            const startStop = stops[currentStopIndex];
            const endStop = stops[currentStopIndex + 1];

            if (!endStop) {
                // End of route
                clearInterval(simulationInterval);
                setIsSimulating(false);
                toast.success("Simulation Completed");
                return;
            }

            // Interpolate position
            const lat = startStop.latitude + (endStop.latitude - startStop.latitude) * progress;
            const lng = startStop.longitude + (endStop.longitude - startStop.longitude) * progress;

            // Emit location update
            socket.emit("driver_location_update", {
                tripId: currentTrip._id,
                location: { latitude: lat, longitude: lng },
                speed: 60 // Simulated speed
            });

            // Advance progress
            progress += 0.05; // 5% per step
            if (progress >= 1) {
                progress = 0;
                currentStopIndex++;
            }
        }, 1000); // Update every second

        // Store interval ID to clear it later (using a ref would be better but simple state for now)
        // For simplicity in this functional component without ref refactoring, we attach it to window or use a cleanup effect
        // Better: use a useEffect to manage the simulation state
        window.simulationInterval = simulationInterval;
    };

    // Cleanup simulation on unmount or stop
    useEffect(() => {
        if (!isSimulating && window.simulationInterval) {
            clearInterval(window.simulationInterval);
            window.simulationInterval = null;
        }
    }, [isSimulating]);

    const handleEnableLocation = () => {
        handleStartTracking();
        setShowLocationModal(false);
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <Loader className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-8 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bus className="h-48 w-48 text-blue-900 transform rotate-12 -mr-12 -mt-12" />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 flex items-center gap-3">
                                <Bus className="h-10 w-10 text-blue-600" />
                                Conductor Portal
                            </h1>
                            <p className="text-gray-500 mt-2 text-lg">
                                {currentTrip
                                    ? `Managing: ${currentTrip.route_id?.routeName || 'Trip #' + currentTrip._id.slice(-4)}`
                                    : "Welcome back! Select a trip to manage."}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {/* Trip Controls */}
                            {currentTrip && (
                                <div className="flex items-center gap-2 mr-4">
                                    {currentTrip.status === "SCHEDULED" && (
                                        <button
                                            onClick={() => handleUpdateTripStatus("IN_TRANSIT")}
                                            className="px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                                        >
                                            Start Trip
                                        </button>
                                    )}
                                    {currentTrip.status === "IN_TRANSIT" && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateTripStatus("COMPLETED")}
                                                className="px-6 py-3 bg-gray-800 text-white rounded-2xl font-bold hover:bg-gray-900 transition-all"
                                            >
                                                End Trip
                                            </button>

                                            {/* Simulation Toggle */}
                                            <button
                                                onClick={handleSimulateTrip}
                                                className={`px-4 py-3 rounded-2xl font-bold transition-all border ${isSimulating ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100"}`}
                                                title="Simulate bus movement for testing"
                                            >
                                                {isSimulating ? "Stop Sim" : "Simulate Route"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {currentTrip && currentTrip.status === "IN_TRANSIT" && (
                                isTracking ? (
                                    <div className="flex flex-col gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleStopTracking}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all shadow-sm border border-red-100"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            Stop GPS
                                        </motion.button>
                                        {/* Real-time stats display */}
                                        {locationStats.lat && (
                                            <div className="text-xs font-mono bg-black/80 text-green-400 p-2 rounded-lg mt-1 space-y-1">
                                                <div>LAT: {locationStats.lat.toFixed(6)}</div>
                                                <div>LNG: {locationStats.lng.toFixed(6)}</div>
                                                <div>SPD: {locationStats.speed ? locationStats.speed.toFixed(1) : 0} km/h</div>
                                                <div className={`${locationStats.accuracy > 100 ? "text-red-400" : "text-green-400"}`}>
                                                    ACC: +/- {Math.round(locationStats.accuracy)}m
                                                </div>
                                                {locationStats.accuracy > 500 && (
                                                    <div className="text-orange-300 italic text-[10px] leading-tight mt-1">
                                                        High error margin. Are you on a laptop/PC?
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStartTracking}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-2xl font-bold hover:bg-green-100 transition-all shadow-sm border border-green-100"
                                    >
                                        <Navigation className="h-5 w-5" /> Start GPS
                                    </motion.button>
                                )
                            )}

                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLogout}
                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Logout"
                            >
                                <LogOut className="h-6 w-6" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <nav className="space-y-4 lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass rounded-3xl p-4 space-y-2"
                        >
                            {[
                                { id: "trips", icon: MapPin, label: "My Trips" },
                                { id: "passengers", icon: Users, label: "Manifest", disabled: !currentTrip },
                                { id: "scan", icon: QrCode, label: "Verify Ticket" },
                                { id: "offline", icon: Banknote, label: "Offline Booking", disabled: !currentTrip },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    disabled={item.disabled}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${activeTab === item.id
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105"
                                        : "text-gray-600 hover:bg-gray-50 hover:pl-6"
                                        } ${item.disabled && "opacity-50 cursor-not-allowed"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-semibold">{item.label}</span>
                                    </div>
                                    {activeTab === item.id && <ChevronRight className="h-4 w-4" />}
                                </button>
                            ))}
                        </motion.div>

                        {currentTrip && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setShowIssueModal(true)}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100 shadow-sm"
                            >
                                <AlertTriangle className="h-5 w-5" />
                                Report Incident
                            </motion.button>
                        )}
                    </nav>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* TRIPS LIST */}
                                {activeTab === "trips" && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Assigned Trips</h2>
                                        {myTrips.length === 0 ? (
                                            <div className="text-center py-20 glass rounded-3xl border-2 border-dashed border-gray-200">
                                                <Bus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500 font-medium">No active trips assigned.</p>
                                            </div>
                                        ) : (
                                            myTrips.map((trip, idx) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    key={trip._id}
                                                    className="glass p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group border-l-8 border-l-blue-500"
                                                >
                                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                                                        <Bus className="h-40 w-40 text-blue-600 transform rotate-12 -mr-8 -mt-8" />
                                                    </div>

                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full ${trip.status === "SCHEDULED" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                                                                    {trip.status}
                                                                </span>
                                                                <h3 className="text-xl font-bold text-gray-900">{trip.route_id?.routeName || 'Unnamed Route'}</h3>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-6 text-gray-500 mt-2">
                                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                                                                    <Calendar className="h-4 w-4 text-blue-500" />
                                                                    {new Date(trip.departure_datetime).toLocaleDateString()}
                                                                </div>
                                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                                                                    <Clock className="h-4 w-4 text-blue-500" />
                                                                    {new Date(trip.departure_datetime).toLocaleTimeString()}
                                                                </div>
                                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                                                                    <Bus className="h-4 w-4 text-blue-500" />
                                                                    {trip.vehicle_id?.bus_number}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => startTripManagement(trip)}
                                                            className="mt-6 md:mt-0 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all"
                                                        >
                                                            Manage
                                                        </motion.button>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Other tabs content similarly enhanced (Simplified for brevity, but applying Glass class) */}
                                {activeTab === "scan" && (
                                    <div className="glass p-8 rounded-3xl">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                                            <div className="p-3 bg-blue-100 rounded-xl"><QrCode className="h-6 w-6 text-blue-600" /></div>
                                            Verify Ticket
                                        </h2>

                                        {/* SCANNER CAMERA */}
                                        <div className="mb-8 bg-black rounded-3xl overflow-hidden shadow-lg relative max-w-sm mx-auto aspect-square flex items-center justify-center">
                                            <QrReader
                                                delay={300}
                                                onError={(err) => console.error("QR Error:", err)}
                                                onScan={(data) => {
                                                    if (data) {
                                                        const scannedText = data?.text || data; // Adapting to library output
                                                        setBookingIdInput(scannedText);
                                                        toast.success("QR Code Scanned!");
                                                        // Optional: Auto-submit
                                                        // handleVerifyTicket({ preventDefault: () => {} });
                                                    }
                                                }}
                                                style={{ width: '100%', height: '100%' }}
                                                facingMode="environment" // Use back camera
                                            />
                                            {/* Overlay */}
                                            <div className="absolute inset-0 border-2 border-white/30 pointer-events-none">
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-lg shadow-[0_0_100px_rgba(59,130,246,0.5)]"></div>
                                                <div className="absolute top-4 left-0 right-0 text-center text-white/80 text-sm font-medium bg-black/50 py-1">Point camera at QR Code</div>
                                            </div>
                                        </div>

                                        <form onSubmit={handleVerifyTicket} className="max-w-xl mx-auto">
                                            <div className="flex shadow-lg rounded-2xl overflow-hidden">
                                                <input
                                                    type="text"
                                                    value={bookingIdInput}
                                                    onChange={(e) => setBookingIdInput(e.target.value)}
                                                    placeholder="Or Enter Booking ID manually..."
                                                    className="flex-1 px-6 py-4 bg-white focus:outline-none"
                                                />
                                                <button type="submit" className="px-8 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
                                                    <Search className="h-6 w-6" />
                                                </button>
                                            </div>
                                        </form>

                                        {/* Result Display enhanced similarly... */}
                                        {verificationResult && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`mt-8 p-8 rounded-3xl text-center ${verificationResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                                            >
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${verificationResult.success ? "bg-green-100" : "bg-red-100"}`}>
                                                    {verificationResult.success ? <UserCheck className="h-8 w-8 text-green-600" /> : <AlertTriangle className="h-8 w-8 text-red-600" />}
                                                </div>
                                                <h3 className={`text-2xl font-bold mb-2 ${verificationResult.success ? "text-green-700" : "text-red-700"}`}>
                                                    {verificationResult.message}
                                                </h3>
                                                {verificationResult.data && (
                                                    <div className="mt-4 text-left space-y-2 bg-white/50 p-4 rounded-xl">
                                                        <p><strong>Passenger:</strong> {verificationResult.data.user_id?.fullName || "Guest"}</p>
                                                        <p><strong>Fare:</strong> ₹{verificationResult.data.total_fare}</p>
                                                        <p><strong>Seats:</strong> {verificationResult.data.seat_numbers?.join(", ")}</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "passengers" && (
                                    <div className="glass p-8 rounded-3xl">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-gray-800">Passenger Manifest</h2>
                                            <div className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-bold">{passengers.length} Onboard</div>
                                        </div>
                                        {/* Table with new stylings... */}
                                        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Passenger</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Seat</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {passengers.map((p, idx) => (
                                                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-gray-900">{p.passengerName || "Guest"}</div>
                                                            </td>
                                                            <td className="px-6 py-4 font-mono text-blue-600 font-bold">{p.seat_numbers?.join(", ") || "-"}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{p.status}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "offline" && (
                                    <div className="glass p-8 rounded-3xl">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                                            <div className="p-3 bg-green-100 rounded-xl"><Banknote className="h-6 w-6 text-green-600" /></div>
                                            Offline Booking
                                        </h2>
                                        {/* Enhanced Form... */}
                                        <form onSubmit={handleOfflineBooking}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                <input
                                                    className="w-full p-4 bg-white rounded-xl border-none shadow-sm focus:ring-2 focus:ring-green-500"
                                                    placeholder="Passenger Name"
                                                    value={offlineDetails.name}
                                                    onChange={e => setOfflineDetails({ ...offlineDetails, name: e.target.value })}
                                                />
                                                <input
                                                    className="w-full p-4 bg-white rounded-xl border-none shadow-sm focus:ring-2 focus:ring-green-500"
                                                    placeholder="Phone Number"
                                                    value={offlineDetails.phone}
                                                    onChange={e => setOfflineDetails({ ...offlineDetails, phone: e.target.value })}
                                                />
                                            </div>
                                            <button className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200 hover:scale-[1.02] transition-transform">
                                                Book Ticket & Collect Cash
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                {/* Modals remain mostly the same but could benefit from backdrop-blur */}
                {showIssueModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6">Report Incident</h2>
                            {/* Form content... */}
                            <form onSubmit={handleReportIssue} className="space-y-4">
                                <textarea
                                    className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-red-500"
                                    rows="4"
                                    placeholder="Describe the issue..."
                                    value={issueForm.description}
                                    onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
                                ></textarea>
                                {/* Select... */}
                                <select
                                    className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-red-500"
                                    value={issueForm.type}
                                    onChange={e => setIssueForm({ ...issueForm, type: e.target.value })}
                                >
                                    <option value="">Select Type</option>
                                    {issueTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowIssueModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200">Submit</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Location Modal... */}
                {showLocationModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white w-full max-w-sm rounded-3xl p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Navigation className="h-10 w-10 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Location Required</h2>
                            <p className="text-gray-500 mb-8">Please enable GPS to continue.</p>
                            <button onClick={handleEnableLocation} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">Enable GPS</button>
                        </motion.div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ConductorDashboard;
