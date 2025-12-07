import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bus,
  Users,
  MapPin,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import MapComponent from "../../components/MapComponent";
import { motion } from "framer-motion";
import { axiosInstance } from "../../utils/axiosInstance";
import { useStaffStore } from "../../store/useStaffStore";

const AdminDashboard = () => {
  const { staffUser, staffLogout } = useStaffStore();
  const [buses, setBuses] = useState([]);
  const [activeBuses, setActiveBuses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    activeTrips: 0,
    staffOnDuty: 0,
    staffTotal: 0,
    conductorsActive: 0,
    conductorsFree: 0,
    driversActive: 0,
    driversFree: 0,
    vehiclesInService: 0,
    vehiclesTotal: 0,
    completedTrips: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, vehiclesRes, tripsRes] = await Promise.all([
          axiosInstance.get("/staff/admin"),
          axiosInstance.get("/vehicle"),
          axiosInstance.get("/admin-trips"),
        ]);

        const staffData = staffRes.data;
        const vehiclesData = vehiclesRes.data;
        const tripsData = tripsRes.data;

        setStaff(staffData);
        setBuses(vehiclesData);
        setTrips(tripsData);

        // Calculate Stats
        const activeTrips = tripsData.filter(t => t.status === "IN_TRANSIT");
        const completedTrips = tripsData.filter(t => t.status === "COMPLETED");

        // Staff logic
        const drivers = staffData.filter(s => s.role === "DRIVER");
        const conductors = staffData.filter(s => s.role === "CONDUCTOR");

        // Assuming a staff is "Active/On Duty" if they are assigned to an active trip
        const activeDriverIds = activeTrips.map(t => t.driver_id?._id || t.driver_id);
        const activeConductorIds = activeTrips.map(t => t.conductor_id?._id || t.conductor_id);

        const driversActiveCount = drivers.filter(d => activeDriverIds.includes(d._id)).length;
        const conductorsActiveCount = conductors.filter(c => activeConductorIds.includes(c._id)).length;

        const activeBusesList = vehiclesData.filter(v => v.status === "ON_TRIP" || activeTrips.some(t => t.vehicle_id?._id === v._id));
        setActiveBuses(activeBusesList.map(bus => ({
          id: bus._id,
          busNumber: bus.bus_number,
          location: { lat: 17.385, lng: 78.4867 } // Mock loc if not available in vehicle/trip
        })));

        // Calculate Revenue (Mock calculation based on completed trips)
        // In real app, sum up bookings
        const estimatedRevenue = completedTrips.length * 5000;

        setStats({
          activeTrips: activeTrips.length,
          staffOnDuty: driversActiveCount + conductorsActiveCount,
          staffTotal: staffData.length,
          conductorsActive: conductorsActiveCount,
          conductorsFree: conductors.length - conductorsActiveCount,
          driversActive: driversActiveCount,
          driversFree: drivers.length - driversActiveCount,
          vehiclesInService: activeBusesList.length,
          vehiclesTotal: vehiclesData.length,
          completedTrips: completedTrips.length,
          totalRevenue: estimatedRevenue
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await staffLogout();
  };

  const activeBusesForMap = activeBuses; // Use state

  const navLinks = [
    { icon: MapPin, label: "Routes", path: "/admin/routes" },
    { icon: Bus, label: "Vehicles", path: "/admin/vehicles" },
    { icon: Users, label: "Staff", path: "/admin/staff" },
    { icon: Activity, label: "Trips", path: "/admin/trips" },
    { icon: AlertTriangle, label: "Issues", path: "/admin/issues" },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass sticky top-0 z-50 border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                  Admin <span className="text-blue-600">Portal</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide">BUS TRANSIT SYSTEM</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="h-8 w-px bg-gray-200 hidden md:block" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all font-semibold"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-500 mt-1">Real-time updates and performance metrics</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-600 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Online
          </div>
        </motion.div>

        {/* Real-time Staff Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Drivers Stats */}
          <motion.div className="glass p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.driversActive + stats.driversFree}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">On Duty</span>
                <span className="font-bold text-gray-900">{stats.driversActive}</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${(stats.driversActive / (stats.driversActive + stats.driversFree || 1)) * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Available</span>
                <span className="font-medium text-gray-700">{stats.driversFree}</span>
              </div>
            </div>
          </motion.div>

          {/* Conductors Stats */}
          <motion.div className="glass p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Conductors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conductorsActive + stats.conductorsFree}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">Active</span>
                <span className="font-bold text-gray-900">{stats.conductorsActive}</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${(stats.conductorsActive / (stats.conductorsActive + stats.conductorsFree || 1)) * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Free</span>
                <span className="font-medium text-gray-700">{stats.conductorsFree}</span>
              </div>
            </div>
          </motion.div>

          {/* Vehicles Stats */}
          <motion.div className="glass p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-2xl text-purple-600"><Bus className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Fleet Status</p>
                <p className="text-2xl font-bold text-gray-900">{stats.vehiclesTotal}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 font-medium">In Transit</span>
                <span className="font-bold text-gray-900">{stats.vehiclesInService}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">In Depot</span>
                <span className="font-medium text-gray-700">{stats.vehiclesTotal - stats.vehiclesInService}</span>
              </div>
            </div>
          </motion.div>

          {/* Trips Stats */}
          <motion.div className="glass p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-2xl text-green-600"><Activity className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active Trips</span>
                <span className="font-bold text-blue-600">{stats.activeTrips}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completed</span>
                <span className="font-bold text-green-600">{stats.completedTrips}</span>
              </div>
            </div>
          </motion.div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Bus Tracking Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass rounded-3xl p-1 overflow-hidden shadow-lg border border-white/50">
              <div className="bg-white rounded-[20px] overflow-hidden relative">
                <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" /> Live Fleet
                  </h3>
                </div>
                <MapComponent
                  center={{ lat: 17.385, lng: 78.4867 }}
                  buses={activeBusesForMap}
                  className="h-[450px]"
                />
              </div>
            </div>
          </motion.div>

          {/* Recent Activities (Mock for now, could actulaly fetch logs if we had an endpoint) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass rounded-3xl p-6 h-[460px] flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" /> Recent Activity
              </h3>
              <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {/* Static placeholders for visual completeness */}
                <div className="text-gray-500 text-sm text-center italic mt-10">Real-time logs coming soon...</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
