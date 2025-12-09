import React, { useState, useEffect } from "react";
import { useStaffStore } from "../../store/useStaffStore";
import { axiosInstance } from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { LogOut, Bus, Clock, Calendar, CheckCircle, XCircle, Play, Square } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const DriverDashboard = () => {
  const { staffUser, staffLogout } = useStaffStore();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Driver's Trips
  const fetchTrips = async () => {
    try {
      const res = await axiosInstance.get("/driver/my-trips");
      setTrips(res.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load your trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleLogout = async () => {
    await staffLogout();
    navigate("/driver/login");
  };

  const handleRespond = async (tripId, status) => {
    try {
      await axiosInstance.put(`/driver/trip/${tripId}/assignment`, { status, role: 'DRIVER' });
      toast.success(`Trip ${status.toLowerCase()} successfully`);
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const handleStatusChange = async (tripId, newStatus) => {
    try {
      // If starting trip, validation might be needed (e.g. accepted first?)
      // Assuming backend handles or UI restricts.

      await axiosInstance.put(`/driver/trip/${tripId}/status`, { status: newStatus });
      toast.success(`Trip is now ${newStatus.replace("_", " ")}`);
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Driver Portal</h1>
              <p className="text-xs text-gray-500">Welcome, {staffUser?.user_id?.fullName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          My Assignments
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading trips...</p>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Bus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No trips assigned to you yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={trip._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{trip.route_id?.routeName}</h3>
                      <div className="flex items-center text-sm text-gray-500 gap-1 mt-1">
                        {trip.route_id?.origin} <span className="text-gray-300">→</span> {trip.route_id?.destination}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {/* Trip Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border 
                                           ${trip.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          trip.status === 'IN_TRANSIT' ? 'bg-green-50 text-green-700 border-green-100 animate-pulse' :
                            'bg-gray-100 text-gray-600'}`}>
                        {trip.status.replace("_", " ")}
                      </span>
                      {/* Acceptance Status */}
                      <div className="text-xs mt-1">
                        Assignment: {getStatusBadge(trip.driver_status)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Clock className="h-3 w-3" /> Departure
                      </div>
                      <div className="font-semibold text-gray-900">
                        {new Date(trip.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(trip.departure_datetime).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Bus className="h-3 w-3" /> Vehicle
                      </div>
                      <div className="font-semibold text-gray-900">
                        {trip.vehicle_id?.bus_number}
                      </div>
                      <div className="text-xs text-gray-400">
                        {trip.vehicle_id?.service_type}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    {trip.driver_status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleRespond(trip._id, 'ACCEPTED')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" /> Accept
                        </button>
                        <button
                          onClick={() => handleRespond(trip._id, 'REJECTED')}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </>
                    )}

                    {trip.driver_status === 'ACCEPTED' && (
                      <>
                        {trip.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleStatusChange(trip._id, 'IN_TRANSIT')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                          >
                            <Play className="h-5 w-5" /> START TRIP
                          </button>
                        )}
                        {trip.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleStatusChange(trip._id, 'COMPLETED')}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                          >
                            <Square className="h-5 w-5" /> END TRIP
                          </button>
                        )}
                        {(trip.status === 'COMPLETED' || trip.status === 'CANCELLED') && (
                          <div className="w-full text-center text-gray-400 font-medium py-2">
                            Trip Ended
                          </div>
                        )}
                      </>
                    )}

                    {trip.driver_status === 'REJECTED' && (
                      <div className="w-full text-center text-red-500 font-medium py-2">
                        You rejected this assignment.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
