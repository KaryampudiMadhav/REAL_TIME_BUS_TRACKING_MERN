import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  Star,
  Filter,
  Wifi,
  Zap,
  Coffee,
  Music,
} from "lucide-react";
import { useUserStore } from "../../store/useUserStore";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state;

  const { buses, loading, searchBuses } = useUserStore();

  useEffect(() => {
    if (buses.length === 0 && searchParams?.from && searchParams?.date) {
      searchBuses(searchParams.from, searchParams.to || "", searchParams.date);
    }
  }, [buses.length, searchParams, searchBuses]);

  const [filters, setFilters] = useState({
    serviceType: "",
    departureTime: "",
    priceRange: "",
  });

  const [showFilters, setShowFilters] = useState(false);



  // Helper to format duration or time (assuming backend sends ISO strings or similar)
  // Adjust these helpers based on your actual API response structure from the 'buses' array
  const formatTime = (dateStr) => {
    if (!dateStr) return "00:00";
    return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "0h 0m";
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formattedBuses = buses.map(trip => ({
    id: trip._id,
    busNumber: trip.vehicle_id?.bus_number || "Unknown",
    serviceType: trip.vehicle_id?.service_type || "Standard",
    operatorName: "TSRTC", // Hardcoded for now as it's not in trip model explicitly
    departureTime: formatTime(trip.departure_datetime),
    arrivalTime: formatTime(trip.arrival_datetime),
    duration: calculateDuration(trip.departure_datetime, trip.arrival_datetime),
    price: 500, // TODO: Fetch from route or trip model if available
    availableSeats: (trip.seat_allocation?.online || 40) - (trip.tickets_booked?.online || 0),
    totalSeats: trip.seat_allocation?.online || 40,
    amenities: trip.vehicle_id?.amenities || ["Wifi", "Charging Point"],
    rating: 4.2, // Mock rating
    route: trip.route_id?.routeName || "Unknown Route",
    rawDeparture: trip.departure_datetime // for sorting/filtering
  }));

  const filteredResults = formattedBuses.filter((result) => {
    if (filters.serviceType && result.serviceType !== filters.serviceType)
      return false;
    // Simple time filters
    const hour = parseInt(result.departureTime.split(":")[0]);
    if (
      filters.departureTime === "morning" &&
      hour >= 12
    )
      return false;
    if (
      filters.departureTime === "evening" &&
      hour < 12
    )
      return false;
    return true;
  });

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "charging port":
        return <Zap className="h-4 w-4" />;
      case "water bottle":
        return <Coffee className="h-4 w-4" />;
      case "music system":
        return <Music className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {searchParams?.from} → {searchParams?.to || "Any"}
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date(searchParams?.date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Filters
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type
                    </label>
                    <select
                      value={filters.serviceType}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          serviceType: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      <option value="Palle Velugu">Palle Velugu</option>
                      <option value="Express">Express</option>
                      <option value="Ultra Deluxe">Ultra Deluxe</option>
                      <option value="Super Luxury">Super Luxury</option>
                      <option value="Indra AC">Indra AC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Time
                    </label>
                    <select
                      value={filters.departureTime}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          departureTime: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any Time</option>
                      <option value="morning">Morning (6AM - 12PM)</option>
                      <option value="evening">Evening (12PM - 12AM)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setFilters({
                      serviceType: "",
                      departureTime: "",
                      priceRange: "",
                    })
                  }
                  className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Results List */}
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            <div className="space-y-4">
              <p className="text-gray-600">
                {filteredResults.length} buses found
              </p>

              {filteredResults.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {bus.operatorName}
                        </h3>
                        <p className="text-gray-600">
                          {bus.serviceType} • {bus.busNumber}
                        </p>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {bus.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">
                          ₹{bus.price}
                        </p>
                        <p className="text-sm text-gray-600">
                          {bus.availableSeats} seats left
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {bus.departureTime}
                          </p>
                          <p className="text-sm text-gray-600">Departure</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <p className="font-medium text-gray-900">
                            {bus.duration}
                          </p>
                          <div className="w-24 h-0.5 bg-gray-300 my-1"></div>
                          <p className="text-xs text-gray-600">Non-stop</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 justify-end">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {bus.arrivalTime}
                          </p>
                          <p className="text-sm text-gray-600">Arrival</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {bus.amenities.map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-600"
                          >
                            {getAmenityIcon(amenity)}
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        {/* Track Bus Button - Only if trip is active or user wants to check location */}
                        {/* Only show if status is IN_TRANSIT or DELAYED? Or always allow checking? 
                            Let's show it always as a feature request, maybe disabled if not active. 
                            For now, simple button that navigates to tracking. 
                        */}
                        <button
                          onClick={() => navigate(`/tracking/${bus.id}`)}
                          className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Track</span>
                        </button>

                        <button
                          onClick={() => navigate(`/seats/${bus.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                        >
                          Select Seats
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
