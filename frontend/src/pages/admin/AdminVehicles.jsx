import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, Bus, AlertTriangle, CheckCircle, Search, Filter } from "lucide-react";
import { axiosInstance } from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const AdminVehicles = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    bus_number: "",
    service_type: "",
    total_seats: 0,
    amenities: [],
    status: "AVAILABLE",
    depot_id: "67531776993a2097e3a9dc9c" // Default dummy depot ID for demo
  });

  const serviceTypes = [
    "Palle Velugu", "Express", "Ultra Deluxe", "Super Luxury", "Indra AC",
    "Garuda Plus", "Amaravati", "Rajdhani", "Vajra"
  ];

  const availableAmenities = [
    "AC", "WiFi", "Charging Ports", "Water Bottle", "Entertainment", "Blankets", "Sleeper", "Reclining Seats"
  ];

  const fetchBuses = async () => {
    setLoading(true);
    try {
      // In a real app, we'd fetch depots too to populate the dropdown
      const res = await axiosInstance.get("/vehicle");
      setBuses(res.data);
      // For demo, if we have vehicles, grab the first one's depot_id to use as default for new buses
      if (res.data.length > 0 && res.data[0].depot_id) {
        setFormData(prev => ({ ...prev, depot_id: res.data[0].depot_id._id || res.data[0].depot_id }));
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await axiosInstance.put(`/vehicle/${editingBus._id}`, formData);
        toast.success("Vehicle updated successfully");
      } else {
        await axiosInstance.post("/vehicle", formData);
        toast.success("Vehicle added successfully");
      }
      setShowModal(false);
      setEditingBus(null);
      fetchBuses();
      resetForm();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast.error(error.response?.data?.message || "Failed to save vehicle");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await axiosInstance.delete(`/vehicle/${id}`);
        toast.success("Vehicle deleted");
        fetchBuses();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      bus_number: "",
      service_type: "",
      total_seats: 0,
      amenities: [],
      status: "AVAILABLE",
      depot_id: formData.depot_id
    });
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      bus_number: bus.bus_number,
      service_type: bus.service_type,
      total_seats: bus.total_seats,
      amenities: bus.amenities,
      status: bus.status,
      depot_id: bus.depot_id._id || bus.depot_id
    });
    setShowModal(true);
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Filter Logic
  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.bus_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || bus.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const map = {
      AVAILABLE: "bg-green-100 text-green-700 border-green-200",
      ON_TRIP: "bg-blue-100 text-blue-700 border-blue-200",
      IN_MAINTENANCE: "bg-orange-100 text-orange-700 border-orange-200",
      OUT_OF_SERVICE: "bg-red-100 text-red-700 border-red-200"
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="glass sticky top-0 z-30 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="p-2 rounded-full hover:bg-white/50 transition-colors text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Bus className="h-6 w-6 text-purple-600" />
                  Fleet Management
                </h1>
                <p className="text-sm text-gray-500">Manage your depots and vehicles</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search Bus Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white/50 border-none focus:ring-2 focus:ring-purple-500 rounded-xl text-sm w-64 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { resetForm(); setShowModal(true); }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-purple-200 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Bus</span>
              </motion.button>
            </div>
          </div>

          {/* Mobile Search & Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["ALL", "AVAILABLE", "ON_TRIP", "IN_MAINTENANCE"].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${filterStatus === status
                    ? "bg-purple-600 text-white border-purple-600 shadow-md transform scale-105"
                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                  }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 font-medium">Loading fleet data...</p>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
            <Bus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No vehicles found</h3>
            <p className="text-gray-500">Try adjusting your filters or add a new bus.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredBuses.map((bus, idx) => (
                <motion.div
                  key={bus._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass p-1 rounded-3xl group hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-white/60 p-6 rounded-[20px] h-full flex flex-col relative overflow-hidden">
                    {/* Decorative gradient blob */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bus.status === 'AVAILABLE' ? 'from-green-500/10' : bus.status === 'ON_TRIP' ? 'from-blue-500/10' : 'from-orange-500/10'} to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none`}></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{bus.bus_number}</h3>
                          {bus.status === 'AVAILABLE' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <p className="text-sm font-medium text-purple-600">{bus.service_type}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(bus.status)}`}>
                        {bus.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Capacity</span>
                        <span className="font-bold text-gray-900">{bus.total_seats} Seats</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bus.amenities.slice(0, 4).map((a, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium border border-gray-200">
                            {a}
                          </span>
                        ))}
                        {bus.amenities.length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-[10px] font-medium">
                            +{bus.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(bus)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <div className="w-px bg-gray-200 my-1"></div>
                      <button
                        onClick={() => handleDelete(bus._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 flex justify-between items-center shrink-0">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  {editingBus ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                  {editingBus ? "Edit Vehicle" : "Add New Vehicle"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Bus Number</label>
                      <input
                        type="text"
                        value={formData.bus_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, bus_number: e.target.value }))}
                        className="w-full bg-gray-50 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-bold text-gray-900 transition-all uppercase placeholder:normal-case"
                        placeholder="e.g. TS09Z1234"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Service Type</label>
                      <select
                        value={formData.service_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                        className="w-full bg-gray-50 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-medium transition-all"
                        required
                      >
                        <option value="">Select Type</option>
                        {serviceTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Capacity</label>
                      <input
                        type="number"
                        value={formData.total_seats}
                        onChange={(e) => setFormData(prev => ({ ...prev, total_seats: Number(e.target.value) }))}
                        className="w-full bg-gray-50 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-bold text-gray-900 transition-all"
                        min="10"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-gray-50 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 font-medium transition-all"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="ON_TRIP">On Trip</option>
                        <option value="IN_MAINTENANCE">In Maintenance</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Amenities</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableAmenities.map(amenity => (
                        <label key={amenity} className={`flex items-center justify-center px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all border ${formData.amenities.includes(amenity) ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'}`}>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.amenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200 transform active:scale-95 transition-all">
                      {editingBus ? "Save Changes" : "Add Vehicle"}
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

export default AdminVehicles;
