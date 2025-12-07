import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Send, Users, Bus, MapPin, Search } from "lucide-react";
import { axiosInstance } from "../../utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MunicipalCrowd = () => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    routeId: "",
    reason: "",
    urgency: "medium",
    additionalBuses: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, tripsRes, routesRes] = await Promise.all([
          axiosInstance.get("/vehicle"),
          axiosInstance.get("/trip"),
          axiosInstance.get("/route")
        ]);
        setVehicles(vehiclesRes.data);
        setTrips(tripsRes.data);
        setRoutes(routesRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load monitoring data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process data for display
  const activeTripData = trips
    .filter((trip) => trip.status === "IN_TRANSIT" || trip.status === "in_transit") // Handle case sensitivity just in case
    .map((trip) => {
      const bus = vehicles.find((b) => b._id === trip.vehicle_id || b._id === trip.vehicle_id?._id);
      const route = routes.find((r) => r._id === trip.route_id || r._id === trip.route_id?._id);

      const currentPassengers = (trip.tickets_booked?.online || 0) + (trip.tickets_booked?.offline || 0);
      const totalSeats = bus?.total_seats || 40;
      const occupancyRate = totalSeats > 0 ? (currentPassengers / totalSeats) * 100 : 0;

      return {
        id: trip._id,
        busNumber: bus?.bus_number || "Unknown",
        routeName: route ? `${route.origin} → ${route.destination}` : "Unknown Route",
        currentPassengers,
        totalSeats,
        occupancyRate,
        isOvercrowded: occupancyRate > 90,
      };
    })
    .filter(t => t.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) || t.routeName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);

    try {
      const selectedRoute = routes.find(r => r._id === requestForm.routeId);
      const routeName = selectedRoute ? `${selectedRoute.origin} to ${selectedRoute.destination}` : "Unknown Route";

      await axiosInstance.post("/municipal/request-bus", {
        routeName: routeName,
        reason: `${requestForm.reason} (Urgency: ${requestForm.urgency}, Extra Buses Needed: ${requestForm.additionalBuses})`
      });

      toast.success(`Request sent successfully for ${requestForm.additionalBuses} extra bus(es).`);
      setShowRequestModal(false);
      setRequestForm({
        routeId: "",
        reason: "",
        urgency: "medium",
        additionalBuses: 1,
      });
    } catch (error) {
      console.error("Request failed:", error);
      toast.error("Failed to send request.");
    } finally {
      setRequestLoading(false);
    }
  };

  const getOccupancyColor = (rate) => {
    if (rate < 50) return "text-green-600 bg-green-100 border-green-200";
    if (rate < 80) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    if (rate < 90) return "text-orange-600 bg-orange-100 border-orange-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  const overcrowdedTrips = activeTripData.filter((trip) => trip.isOvercrowded);
  const totalActivePassengers = activeTripData.reduce((sum, trip) => sum + trip.currentPassengers, 0);
  const totalCapacity = activeTripData.reduce((sum, trip) => sum + trip.totalSeats, 0);
  const averageOccupancy = totalCapacity > 0 ? (totalActivePassengers / totalCapacity) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="glass sticky top-0 z-30 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/municipal/dashboard"
                className="p-2 rounded-full hover:bg-white/50 transition-colors text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-orange-600" /> Crowd Monitoring
                </h1>
                <p className="text-sm text-gray-500">Real-time congestion tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search Active Trips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white/50 border-none focus:ring-2 focus:ring-orange-500 rounded-xl text-sm w-64 transition-all"
                />
              </div>
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-orange-200 flex items-center space-x-2 transform active:scale-95 transition-all"
              >
                <Send className="h-5 w-5" />
                <span>Request Bus</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Active Trips", value: activeTripData.length, icon: Bus, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Current Pax", value: totalActivePassengers, icon: Users, color: "text-green-500", bg: "bg-green-50" },
                { label: "Avg Occupancy", value: `${Math.round(averageOccupancy)}%`, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
                { label: "Overcrowded", value: overcrowdedTrips.length, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
              ].map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="glass p-1 rounded-3xl"
                >
                  <div className="bg-white/60 p-6 rounded-[20px] flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{item.label}</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{item.value}</h3>
                    </div>
                    <div className={`p-3 rounded-2xl ${item.bg}`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Overcrowded Alert */}
            <AnimatePresence>
              {overcrowdedTrips.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-50 border border-red-200 rounded-3xl p-6 flex items-start gap-4 shadow-sm"
                >
                  <div className="p-2 bg-red-100 rounded-full shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-800 text-lg">High Congestion Alert</h3>
                    <p className="text-red-700 mt-1">
                      {overcrowdedTrips.length} bus(es) are currently operating at over 90% capacity. Immediate action recommended.
                    </p>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="mt-3 text-red-700 font-bold text-sm bg-red-100 hover:bg-red-200 px-4 py-2 rounded-xl transition-colors"
                    >
                      Deploy Extra Buses
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Real-time Trip Table */}
            <div className="glass p-1 rounded-3xl">
              <div className="bg-white/60 rounded-[20px] overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Bus className="h-5 w-5 text-gray-400" /> Real-time Trip Monitoring
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Bus</th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Route</th>
                        <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Load</th>
                        <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeTripData.length > 0 ? (
                        activeTripData.map((trip, idx) => (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={trip.id}
                            className="hover:bg-white/80 transition-colors"
                          >
                            <td className="px-8 py-4 font-bold text-gray-900">
                              {trip.busNumber}
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-orange-400" />
                                <span className="font-medium text-gray-700">{trip.routeName}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-gray-900">{trip.currentPassengers} / {trip.totalSeats}</span>
                                <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${trip.occupancyRate > 90 ? 'bg-red-500' : trip.occupancyRate > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(trip.occupancyRate, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4 text-center">
                              <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border ${getOccupancyColor(trip.occupancyRate)}`}>
                                {Math.round(trip.occupancyRate)}% Occupancy
                              </span>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-12 text-gray-500">
                            <div className="flex flex-col items-center">
                              <Bus className="h-10 w-10 text-gray-300 mb-2" />
                              No active trips found.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Request Extra Buses Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Send className="h-5 w-5" /> Request Extra Fleet
                </h3>
                <button onClick={() => setShowRequestModal(false)} className="text-white/80 hover:text-white transition-colors">✕</button>
              </div>

              <div className="p-8">
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Select Route</label>
                    <select
                      value={requestForm.routeId}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, routeId: e.target.value }))}
                      className="w-full bg-gray-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-medium transition-all"
                      required
                    >
                      <option value="">Select affected route</option>
                      {routes.map(route => (
                        <option key={route._id} value={route._id}>{route.origin} → {route.destination}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Extra Buses</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={requestForm.additionalBuses}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, additionalBuses: Number(e.target.value) }))}
                        className="w-full bg-gray-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-bold text-gray-900 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Urgency</label>
                      <select
                        value={requestForm.urgency}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, urgency: e.target.value }))}
                        className="w-full bg-gray-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-medium transition-all"
                      >
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Reason</label>
                    <textarea
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full bg-gray-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-medium transition-all min-h-[100px]"
                      placeholder="Describe the situation..."
                      required
                    />
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={requestLoading} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-200 transform active:scale-95 transition-all">
                      {requestLoading ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MunicipalCrowd;
