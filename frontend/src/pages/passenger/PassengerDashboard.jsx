import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  MapPin,
  Star,
  Shield,
  Wifi,
  Zap,
  Bus,
  Clock,
  Navigation
} from "lucide-react";
import VoiceSearch from "../../components/VoiceSearch";
import toast from "react-hot-toast";
import { useUserStore } from "./../../store/useUserStore";
import { motion } from "framer-motion";

const PassengerDashboard = () => {
  const navigate = useNavigate();
  /* State for Tab Selection */
  const [activeSearchTab, setActiveSearchTab] = useState("route"); // 'route' or 'bus'

  const [searchForm, setSearchForm] = useState({
    from: "",
    to: "",
    date: "",
    busNumber: "" // New field
  });

  const [popularRoutes, setPopularRoutes] = useState([]);
  const { loading, searchBuses, fetchPopularRoutes, getAllActiveBuses } = useUserStore();

  // Fetch popular routes on mount
  React.useEffect(() => {
    fetchPopularRoutes().then(data => {
      if (data && data.length > 0) setPopularRoutes(data);
    });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      if (activeSearchTab === "route") {
        await searchBuses(searchForm.from, searchForm.to, searchForm.date);
        navigate("/search", { state: searchForm });
      } else {
        await searchBuses(null, null, searchForm.date, searchForm.busNumber);
        navigate("/search", { state: { ...searchForm, mode: 'bus' } });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Search failed. Check inputs.");
    }
  };

  const handleVoiceResult = (field) => (text) => {
    setSearchForm((prev) => ({ ...prev, [field]: text }));
  };

  // Placeholder removed, used state popularRoutes instead
  // const popularRoutes = [ ... ]

  const features = [
    { icon: Shield, title: "Safe Travel", desc: "Verified drivers & sanitized buses", color: "green" },
    { icon: Wifi, title: "Free WiFi", desc: "Stay connected throughout your journey", color: "blue" },
    { icon: Zap, title: "Live Tracking", desc: "Real-time updates & accurate ETAs", color: "yellow" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 pb-20 pt-24 md:pb-32 md:pt-20 rounded-b-[40px] shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              Trusted by 1 Million+ Travelers
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight mt-4 md:mt-0">
              Your Journey Begins <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">With Comfort</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Experience premium bus travel with live tracking, top-tier amenities, and verified safety standards.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-1 shadow-2xl"
        >
          <div className="bg-white/80 backdrop-blur rounded-[20px] p-6 md:p-8">
            {/* Search Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-2">
              <button
                onClick={() => setActiveSearchTab("route")}
                className={`pb-2 px-4 font-bold text-lg transition-colors relative ${activeSearchTab === "route" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                Search by Route
                {activeSearchTab === "route" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
              </button>
              <button
                onClick={() => setActiveSearchTab("bus")}
                className={`pb-2 px-4 font-bold text-lg transition-colors relative ${activeSearchTab === "bus" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                Search by Bus Number
                {activeSearchTab === "bus" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
              </button>
            </div>

            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {activeSearchTab === "route" ? (
                  <>
                    {/* From Input */}
                    <div className="relative group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">From</label>
                      <div className="relative">
                        <Navigation className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 group-focus-within:scale-110 transition-transform" />
                        <input
                          type="text"
                          value={searchForm.from}
                          onChange={(e) => setSearchForm((prev) => ({ ...prev, from: e.target.value }))}
                          className="w-full pl-12 pr-12 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
                          placeholder="Departure City"
                          required
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <VoiceSearch onResult={handleVoiceResult("from")} />
                        </div>
                      </div>
                    </div>

                    {/* To Input */}
                    <div className="relative group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">To</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500 group-focus-within:scale-110 transition-transform" />
                        <input
                          type="text"
                          value={searchForm.to}
                          onChange={(e) => setSearchForm((prev) => ({ ...prev, to: e.target.value }))}
                          className="w-full pl-12 pr-12 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
                          placeholder="Destination City (Optional)"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <VoiceSearch onResult={handleVoiceResult("to")} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Bus Number Input */
                  <div className="relative group md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Bus Number</label>
                    <div className="relative">
                      <Bus className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 group-focus-within:scale-110 transition-transform" />
                      <input
                        type="text"
                        value={searchForm.busNumber}
                        onChange={(e) => setSearchForm((prev) => ({ ...prev, busNumber: e.target.value }))}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-900 uppercase"
                        placeholder="e.g. AP21Z1234"
                        required
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <VoiceSearch onResult={handleVoiceResult("busNumber")} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Date Input */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500 group-focus-within:scale-110 transition-transform" />
                    <input
                      type="date"
                      value={searchForm.date}
                      onChange={(e) => setSearchForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
                      min={new Date().toISOString().split("T")[0]}
                      // Date optional for bus search? No, keep required for simplicity or make optional.
                      // Backend handles optional. Let's make it optional for Bus Search, required for Route.
                      required={activeSearchTab === 'route'}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transform transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  <span>{activeSearchTab === 'route' ? 'Search Buses' : 'Track Bus'}</span>
                </button>
              </div>
            </form>

            {/* View All Active Buses Link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  getAllActiveBuses();
                  navigate("/search", { state: { title: "Live Active Buses" } });
                }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                Don't have specifics? View all active buses
              </button>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow flex items-start gap-4"
            >
              <div className={`p-4 rounded-2xl bg-${feature.color}-100 text-${feature.color}-600`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Popular Routes */}
        <div className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Popular Routes</h2>
            <button className="text-blue-600 font-semibold hover:text-blue-700">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((route, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
                className="group bg-white rounded-3xl p-1 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                onClick={() => {
                  const searchData = { from: route.from, to: route.to, date: new Date().toISOString().split("T")[0] };
                  setSearchForm(searchData);
                  // Also navigate to search results directly for better UX
                  // We need to trigger the search in store first or pass params to SearchResults page
                  // Since SearchResults page relies on 'location.state', this works:
                  searchBuses(searchData.from, searchData.to, searchData.date).then(() => {
                    navigate("/search", { state: searchData });
                  });
                }}
              >
                <div className="bg-white rounded-[20px] p-5 h-full border border-gray-100 group-hover:border-blue-100 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                      <Bus className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg">Daily</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-bold text-lg">{route.from}</span>
                      <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-3"></div>
                      <span className="text-gray-900 font-bold text-lg">{route.to}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {route.duration}</span>
                      <span className="text-lg font-bold text-blue-600">{route.price}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;
