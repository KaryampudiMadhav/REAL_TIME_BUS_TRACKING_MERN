import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, CreditCard } from "lucide-react";
import SeatLayout from "../../components/SeatLayout";
import { axiosInstance } from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SeatSelection = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);

  // State to hold details for MULTIPLE passengers
  const [passengers, setPassengers] = useState([]);

  // When selectedSeats changes, resize the passengers array
  // When selectedSeats changes, resize the passengers array (ONLY FOR SEAT BOOKING)
  useEffect(() => {
    // If ticket based, we handle passengers manually in the helper
    if (trip && ['Palle Velugu', 'Express'].includes(trip.vehicle_id.service_type)) return;

    setPassengers(prevPass => {
      const newPass = [];
      selectedSeats.forEach((seat, index) => {
        if (prevPass[index]) {
          newPass.push({ ...prevPass[index], seatNumber: seat });
        } else {
          newPass.push({ name: '', age: '', gender: 'Male', seatNumber: seat });
        }
      });
      return newPass;
    });
  }, [selectedSeats, trip]);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize Socket for Real-time Seat updates
  useEffect(() => {
    if (!tripId) return;
    const newSocket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:7000");
    setSocket(newSocket);

    newSocket.emit("join_seat_selection", tripId);

    newSocket.on("seat_status_update", ({ heldSeats }) => {
      // Refresh or merge held seats with booked seats
      // For simplicity, we can just fetch trip again or maintain a separate "held" state
      // But to ensure accuracy, we will treat held seats as "booked" in the UI for others.
      setBookedSeats(prev => {
        // Merge unique seats
        const newSet = new Set([...prev, ...heldSeats]);
        return Array.from(newSet);
      });
    });

    return () => {
      newSocket.disconnect();
    }
  }, [tripId]);

  // Fetch Trip Data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await axiosInstance.get(`/passenger/trips/${tripId}`);
        setTrip(response.data);
        // Combine permanently booked seats with any temporary held seats if applicable
        // For now using booked_seats from model
        setBookedSeats(response.data.booked_seats || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError("Failed to load trip details.");
        setLoading(false);
      }
    };

    if (tripId) fetchTrip();
  }, [tripId]);

  // Calculate Price: Distance * Rate (2.5)
  // This should ideally be fetched from backend or consistent with backend logic
  const ratePerKm = 2.5;
  const ticketPrice = trip ? Math.round(trip.route_id.distance_km * ratePerKm) : 0;
  const totalFare = selectedSeats.length * ticketPrice;

  const handleProceedToBook = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    setShowBookingForm(true);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    // Validate all passengers
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || !p.age || !p.gender) {
        toast.error(`Please fill details for Passenger ${i + 1}`);
        return;
      }
    }

    try {
      const isTicketBooking = ['Palle Velugu', 'Express'].includes(trip.vehicle_id.service_type);
      const bookingData = {
        trip_id: tripId,
        seat_numbers: isTicketBooking ? [] : selectedSeats,
        ticketCount: isTicketBooking ? passengers.length : 0,
        passengers: passengers, // Send array of passengers
      };

      console.log("Booking Payload:", bookingData); // Debug log

      if (!isTicketBooking && passengers.length !== selectedSeats.length) {
        toast.error(`Please provide details for all ${selectedSeats.length} passengers.`);
        return;
      }

      // Call API
      const response = await axiosInstance.post("/bookings", bookingData);

      toast.success("Booking successful!");
      // Navigate to confirmation with booking details
      navigate("/booking-confirmation", { state: { booking: response.data } });

    } catch (err) {
      console.error("Booking failed:", err);
      toast.error(err.response?.data?.error || "Booking failed. Please try again.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !trip) return <div className="min-h-screen flex items-center justify-center text-red-600">{error || "Trip not found"}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Search Results</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {['Palle Velugu', 'Express'].includes(trip.vehicle_id.service_type) ? "Select Number of Tickets" : "Select Your Seats"}
              </h2>
              <div className="mb-4">
                <p className="text-gray-600">
                  {trip.vehicle_id.service_type} • {trip.vehicle_id.bus_number} •{" "}
                  {trip.vehicle_id.total_seats} seats
                </p>
                <p className="text-sm text-gray-500">
                  {trip.route_id.origin} → {trip.route_id.destination} •{" "}
                  {new Date(trip.departure_datetime).toLocaleString()}
                </p>
              </div>

              {['Palle Velugu', 'Express'].includes(trip.vehicle_id.service_type) ? (
                <div className="flex flex-col items-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="mb-4 text-lg font-medium text-gray-700">How many tickets?</p>
                  <div className="flex items-center gap-4">
                    <button
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700 transition"
                      onClick={() => {
                        const newCount = Math.max(0, passengers.length - 1);
                        setPassengers(prev => prev.slice(0, newCount));
                        setSelectedSeats(Array(newCount).fill("Ticket")); // Dummy array for count length check
                      }}
                    >
                      -
                    </button>
                    <span className="text-3xl font-bold text-blue-600 w-12 text-center">{passengers.length}</span>
                    <button
                      className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-xl font-bold text-blue-700 transition"
                      onClick={() => {
                        const newCount = Math.min(6, passengers.length + 1);
                        setPassengers(prev => {
                          if (prev.length < newCount) {
                            return [...prev, { name: '', age: '', gender: 'Male', seatNumber: 'Ticket' }];
                          }
                          return prev;
                        });
                        setSelectedSeats(Array(newCount).fill("Ticket"));
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-gray-500">Max 6 tickets per booking</p>
                </div>
              ) : (
                <SeatLayout
                  totalSeats={trip.vehicle_id.total_seats}
                  bookedSeats={bookedSeats}
                  serviceType={trip.vehicle_id.service_type}
                  selectedSeats={selectedSeats}
                  onSeatSelect={(newSelectedSeats) => {
                    setSelectedSeats(newSelectedSeats);
                    if (socket) {
                      if (newSelectedSeats.length > selectedSeats.length) {
                        const addedSeat = newSelectedSeats.find(s => !selectedSeats.includes(s));
                        if (addedSeat) socket.emit("hold_seats", { tripId, seatNumbers: [addedSeat], userId: socket.id });
                      } else {
                        const removedSeat = selectedSeats.find(s => !newSelectedSeats.includes(s));
                        if (removedSeat) socket.emit("release_seats", { tripId, seatNumbers: [removedSeat] });
                      }
                    }
                  }}
                />
              )}
            </div>

            {/* Passenger Details Form */}
            {showBookingForm && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Passenger Details
                </h3>
                <form onSubmit={handleBooking} className="space-y-6">
                  {passengers.map((p, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Passenger {index + 1} <span className="text-sm font-normal text-gray-500">(Seat {p.seatNumber})</span></h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => {
                              const newPass = [...passengers];
                              newPass[index].name = e.target.value;
                              setPassengers(newPass);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                            placeholder="Name"
                            required
                          />
                        </div>

                        {/* Age & Gender */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                            <input
                              type="number"
                              value={p.age}
                              onChange={(e) => {
                                const newPass = [...passengers];
                                newPass[index].age = e.target.value;
                                setPassengers(newPass);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                              placeholder="Age"
                              required
                              min="1"
                              max="120"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                            <select
                              value={p.gender}
                              onChange={(e) => {
                                const newPass = [...passengers];
                                newPass[index].gender = e.target.value;
                                setPassengers(newPass);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Proceed to Payment</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Booking Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{trip.route_id.origin} → {trip.route_id.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(trip.departure_datetime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {new Date(trip.departure_datetime).toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus:</span>
                  <span className="font-medium">{trip.vehicle_id.bus_number}</span>
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div className="border-t pt-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Selected Seats
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedSeats.map((seat) => (
                      <span
                        key={seat}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Seat(s) ({selectedSeats.length}):
                      </span>
                      <span className="font-medium">₹{totalFare}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">₹{totalFare}</span>
                    </div>
                  </div>
                </div>
              )}

              {!showBookingForm ? (
                <button
                  onClick={handleProceedToBook}
                  disabled={selectedSeats.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {selectedSeats.length === 0
                    ? "Select Seats"
                    : "Proceed to Book"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedSeats([]);
                  }}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Change Seats
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
