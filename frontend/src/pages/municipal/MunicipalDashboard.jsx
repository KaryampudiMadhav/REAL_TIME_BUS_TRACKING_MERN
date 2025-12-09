import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, TrendingUp, Users, AlertTriangle, Bus, MapPin, Clock, Menu, X, LogOut } from "lucide-react";
import { axiosInstance } from "../../utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const MunicipalDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    activeBuses: 0,
    totalPassengers: 0,
    todayRevenue: 0,
    inTransit: 0,
    crowdPercentage: 0
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [routeData, setRouteData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, crowdRes, routesRes, vehiclesRes, analyticsRes] = await Promise.all([
          axiosInstance.get("/stats/admin-stats"),
          axiosInstance.get("/municipal/crowd-report"),
          axiosInstance.get("/route"),
          axiosInstance.get("/vehicle"),
          axiosInstance.get("/municipal/analytics")
        ]);

        const statsData = statsRes.data;
        // crowdRes.data is used for detailed report, but we calculate summary below
        const routes = routesRes.data;
        const analyticsData = analyticsRes.data;

        // Helper to calculate total capacity for accurate crowd %
        const vehicleMap = new Map();
        vehiclesRes.data.forEach(v => vehicleMap.set(v._id, v));

        // Use precise trips data for charts and accurate local calcs
        const tripsRes = await axiosInstance.get("/trip");
        const trips = tripsRes.data;
        const activeTrips = trips.filter(t => t.status === "IN_TRANSIT");

        // Calculate accurate crowd percentage based on REAL active trips
        let totalCapacity = 0;
        let currentPassengers = 0;

        activeTrips.forEach(trip => {
          const vId = trip.vehicle_id?._id || trip.vehicle_id;
          const vehicle = vehicleMap.get(vId);
          const cap = vehicle?.total_seats || 40;
          totalCapacity += cap;

          const pax = (trip.tickets_booked?.online || 0) + (trip.tickets_booked?.offline || 0);
          currentPassengers += pax;
        });

        const crowdPercentage = totalCapacity > 0 ? Math.round((currentPassengers / totalCapacity) * 100) : 0;

        // Use real stats from backend
        setStats({
          activeBuses: activeTrips.length,
          totalPassengers: statsData.ticketsSoldToday,
          todayRevenue: statsData.todaysRevenue,
          inTransit: activeTrips.length,
          crowdPercentage: crowdPercentage
        });

        // Real Hourly Data from Analytics Endpoint
        // analyticsData.dailyBookings is [{time: "06:00", bookings: 5}, ...]
        const realHourly = analyticsData.dailyBookings.map(item => ({
          hour: item.time,
          passengers: item.bookings
        }));

        // If we have data, use it. If completely empty (e.g. no bookings today), show 0s.
        setHourlyData(realHourly.length > 0 ? realHourly : [
          { hour: "06:00", passengers: 0 },
          { hour: "08:00", passengers: 0 },
          { hour: "10:00", passengers: 0 },
          { hour: "12:00", passengers: 0 },
          { hour: "14:00", passengers: 0 },
          { hour: "16:00", passengers: 0 },
          { hour: "18:00", passengers: 0 },
          { hour: "20:00", passengers: 0 },
        ]);

        // Route Data for Pie Chart
        const routeUsage = routes.map(route => {
          const tripsOnRoute = trips.filter(t => t.route_id === route._id || t.route_id?._id === route._id).length;
          return {
            name: route.routeName.split(" to ")[1] || route.destination,
            value: tripsOnRoute
          };
        }).filter(r => r.value > 0);

        const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
        setRouteData(routeUsage.map((r, i) => ({ ...r, color: colors[i % colors.length] })));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCrowdColor = (percentage) => {
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getCrowdBgColor = (percentage) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2.5 rounded-xl shadow-lg shadow-orange-200">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                  Municipal <span className="text-orange-600">Overview</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide">CITY TRANSPORT ANALYTICS</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-2">
                <Link to="/municipal/dashboard" className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl font-bold text-sm">Dashboard</Link>
                <Link to="/municipal/crowd" className="px-4 py-2 text-gray-600 hover:text-orange-600 font-medium text-sm transition-colors">Crowd Monitor</Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                <Link
                  to="/municipal/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl font-bold"
                >
                  <Activity className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  to="/municipal/crowd"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl font-medium transition-colors"
                >
                  <Users className="h-5 w-5" />
                  Crowd Monitor
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Active Buses", value: stats.activeBuses, icon: Bus, color: "blue", bg: "from-blue-500 to-cyan-500" },
                { label: "Passengers Now", value: stats.totalPassengers, icon: Users, color: "green", bg: "from-green-500 to-emerald-500" },
                { label: "In Transit", value: stats.inTransit, icon: Activity, color: "orange", bg: "from-orange-500 to-amber-500" },
                { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, icon: TrendingUp, color: "purple", bg: "from-purple-500 to-violet-500" },
              ].map((stat, index) => (
                <motion.div variants={itemVariants} key={index} className="glass p-1 rounded-3xl">
                  <div className="bg-white/60 p-6 rounded-[20px] relative overflow-hidden h-full">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.bg} opacity-10 rounded-bl-3xl -mr-4 -mt-4`}></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 font-medium text-sm">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                      </div>
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.bg} shadow-lg shadow-${stat.color}-100`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Crowd Meter */}
              <motion.div variants={itemVariants} className="glass p-1 rounded-3xl">
                <div className="bg-white/60 p-8 rounded-[20px] h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <h3 className="text-lg font-bold text-gray-900 absolute top-6 left-6">Crowd Meter</h3>
                  <div className="relative w-48 h-48 mt-4">
                    <div className="w-full h-full rounded-full bg-gray-100/50 border-8 border-white shadow-inner"></div>
                    <div className="absolute inset-0 rounded-full" style={{
                      background: `conic-gradient(${stats.crowdPercentage < 50 ? '#10B981' : stats.crowdPercentage < 80 ? '#F59E0B' : '#EF4444'} ${stats.crowdPercentage * 3.6}deg, transparent 0deg)`,
                      maskImage: 'radial-gradient(transparent 60%, black 61%)',
                      WebkitMaskImage: 'radial-gradient(transparent 60%, black 61%)'
                    }}></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-5xl font-bold ${getCrowdColor(stats.crowdPercentage)}`}>{stats.crowdPercentage}%</span>
                      <span className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Capacity Used</span>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col items-center">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold bg-white shadow-sm border ${getCrowdColor(stats.crowdPercentage)} border-opacity-20`}>
                      {stats.crowdPercentage < 50 ? "Low Congestion" : stats.crowdPercentage < 80 ? "Moderate Load" : "High Congestion"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Hourly Flow Chart */}
              <motion.div variants={itemVariants} className="lg:col-span-2 glass p-1 rounded-3xl">
                <div className="bg-white/60 p-8 rounded-[20px] h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" /> Hourly Passenger Flow
                    </h3>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyData}>
                        <defs>
                          <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="passengers" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorPass)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Route Distribution & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants} className="glass p-1 rounded-3xl">
                <div className="bg-white/60 p-8 rounded-[20px] h-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Route Distribution</h3>
                  <div className="flex items-center justify-center">
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={routeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            cornerRadius={6}
                          >
                            {routeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-3 ml-4">
                      {routeData.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                          <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass p-1 rounded-3xl">
                <div className="bg-white/60 p-8 rounded-[20px] h-full flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" /> Insights & Alerts
                  </h3>
                  <div className="space-y-4 flex-1">
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-default">
                      <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Peak Traffic Detected</h4>
                        <p className="text-xs text-gray-600 mt-1">Evening rush hour from 18:00 has started. Passenger load increased by 15%.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-default">
                      <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                        <Bus className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Deployment Recommendation</h4>
                        <p className="text-xs text-gray-600 mt-1">Hyderabad to Bangalore route is exceeding 80% capacity. Consider adding 2 extra buses.</p>
                        <Link to="/municipal/crowd" className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-2 inline-block hover:underline">Manage Fleet →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MunicipalDashboard;
