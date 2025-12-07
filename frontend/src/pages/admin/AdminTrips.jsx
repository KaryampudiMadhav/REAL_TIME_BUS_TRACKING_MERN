import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, Clock, Users, RefreshCw, Calendar, ChevronRight } from "lucide-react";
import { axiosInstance } from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [conductors, setConductors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    routeId: "",
    busId: "",
    driverId: "",
    conductorId: "",
    departureTime: "",
    onlineSeats: 0,
    offlineSeats: 0
  });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsRes, routesRes, vehiclesRes, staffRes] = await Promise.all([
        axiosInstance.get("/admin-trips"),
        axiosInstance.get("/admin-routes"),
        axiosInstance.get("/vehicle"),
        axiosInstance.get("/staff/admin"),
      ]);

      setTrips(tripsRes.data);
      setRoutes(routesRes.data);
      setVehicles(vehiclesRes.data);

      const allStaff = staffRes.data;
      setDrivers(allStaff.filter((s) => s.role === "DRIVER"));
      setConductors(allStaff.filter((s) => s.role === "CONDUCTOR"));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update seat defaults when bus changes
  useEffect(() => {
    if (formData.busId) {
      const bus = vehicles.find(v => v._id === formData.busId);
      if (bus) {
        // Default: 70% Online, 30% Offline
        const total = bus.total_seats;
        const offline = Math.floor(total * 0.3);
        const online = total - offline;
        setFormData(prev => ({ ...prev, onlineSeats: online, offlineSeats: offline }));
      }
    }
  }, [formData.busId, vehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalAllocated = Number(formData.onlineSeats) + Number(formData.offlineSeats);
      const selectedBus = vehicles.find(v => v._id === formData.busId);

      if (selectedBus && totalAllocated > selectedBus.total_seats) {
        return toast.error(`Total seats (${totalAllocated}) exceeds bus capacity (${selectedBus.total_seats})`);
      }

      await axiosInstance.post("/admin-trips", {
        route_id: formData.routeId,
        vehicle_id: formData.busId,
        driver_id: formData.driverId,
        conductor_id: formData.conductorId,
        departure_datetime: formData.departureTime,
        seat_allocation: {
          online: Number(formData.onlineSeats),
          offline: Number(formData.offlineSeats)
        }
      });

      toast.success("Trip successfully scheduled!");
      setShowModal(false);
      fetchData(); // Refresh list
      setFormData({ // Reset
        routeId: "",
        busId: "",
        driverId: "",
        conductorId: "",
        departureTime: "",
        onlineSeats: 0,
        offlineSeats: 0
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create trip");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
      IN_TRANSIT: "bg-green-100 text-green-800 border-green-200",
      COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      DELAYED: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="glass sticky top-0 z-30 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="p-2 rounded-full hover:bg-white/50 transition-colors text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  Trip Manager
                </h1>
                <p className="text-sm text-gray-500">Schedule and manage bus trips</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchData}
                className="p-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-purple-200 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Trip</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-[30px] overflow-hidden shadow-xl border border-white/50">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin mb-4 text-purple-500" />
              <p>Loading schedule...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/50 backdrop-blur-sm border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Route Details</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Crew</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white/60">
                  {trips.length === 0 ? (
                    <tr><td colSpan="6" className="p-12 text-center text-gray-500 font-medium">No trips scheduled for today.</td></tr>
                  ) : trips.map((trip, idx) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={trip._id}
                      className="hover:bg-purple-50/50 transition-colors group"
                    >
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {trip.route_id?.routeName || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                              {trip.route_id?.origin} <ChevronRight className="h-3 w-3" /> {trip.route_id?.destination}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="text-gray-400">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {new Date(trip.departure_datetime).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {new Date(trip.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded w-fit">
                          {trip.vehicle_id?.bus_number}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 pl-1">
                          {trip.vehicle_id?.service_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">D</span>
                            <span className="text-gray-700 font-medium">{trip.driver_id?.user_id?.fullName || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-[10px]">C</span>
                            <span className="text-gray-700 font-medium">{trip.conductor_id?.user_id?.fullName || 'Unassigned'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(trip.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                          {trip.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-purple-600 transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Trip Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h3 className="text-2xl font-bold text-white relative z-10">Schedule New Trip</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all relative z-10"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Route */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Route</label>
                    <select
                      value={formData.routeId}
                      onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                      className="w-full bg-gray-50 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-medium transition-all"
                      required
                    >
                      <option value="">Select Route</option>
                      {routes.map((route) => (
                        <option key={route._id} value={route._id}>
                          {route.routeName} ({route.origin} → {route.destination})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Vehicle</label>
                    <select
                      value={formData.busId}
                      onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                      className="w-full bg-gray-50 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-medium transition-all"
                      required
                    >
                      <option value="">Select Bus</option>
                      {vehicles.filter(v => v.status === 'AVAILABLE').map((bus) => (
                        <option key={bus._id} value={bus._id}>
                          {bus.bus_number} ({bus.service_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Driver */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Driver</label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                      className="w-full bg-gray-50 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-medium transition-all"
                      required
                    >
                      <option value="">Select Driver</option>
                      {drivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.user_id?.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Conductor */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Conductor</label>
                    <select
                      value={formData.conductorId}
                      onChange={(e) => setFormData({ ...formData, conductorId: e.target.value })}
                      className="w-full bg-gray-50 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-medium transition-all"
                      required
                    >
                      <option value="">Select Conductor</option>
                      {conductors.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.user_id?.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Departure */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Departure Time</label>
                    <input
                      type="datetime-local"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      className="w-full bg-gray-50 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-medium transition-all"
                      required
                    />
                  </div>

                  {/* Seat Allocation (Auto/Manual) */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="col-span-2 flex justify-between items-center text-sm font-bold text-gray-700 mb-2">
                      <span>Seat Allocation</span>
                      <span className="bg-white px-2 py-1 rounded-md text-xs border border-gray-200">Total: {vehicles.find(v => v._id === formData.busId)?.total_seats || 0}</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-blue-600 uppercase tracking-wide">Online Quota</label>
                      <input
                        type="number"
                        value={formData.onlineSeats}
                        onChange={(e) => setFormData({ ...formData, onlineSeats: e.target.value })}
                        className="w-full bg-white border-transparent focus:border-blue-500 focus:ring-0 rounded-xl px-4 py-3 font-bold text-gray-900 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-purple-600 uppercase tracking-wide">Offline Quota</label>
                      <input
                        type="number"
                        value={formData.offlineSeats}
                        onChange={(e) => setFormData({ ...formData, offlineSeats: e.target.value })}
                        className="w-full bg-white border-transparent focus:border-purple-500 focus:ring-0 rounded-xl px-4 py-3 font-bold text-gray-900 shadow-sm"
                      />
                    </div>
                  </div>

                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-200 transform active:scale-95 transition-all"
                  >
                    Confirm Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTrips;
