import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Bus, QrCode, AlertCircle } from "lucide-react";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            // Endpoint confirmed: /api/bookings/mybookings
            const response = await axiosInstance.get("/bookings/mybookings");
            setBookings(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError("Failed to load your bookings.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                )}

                {bookings.length === 0 && !error ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Bus className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            No bookings found
                        </h2>
                        <p className="text-gray-600 mb-6">
                            You haven't booked any trips yet. Start your journey today!
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            Search Buses
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div
                                key={booking._id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center space-x-2 text-blue-600 mb-1">
                                                <Bus className="h-5 w-5" />
                                                <span className="font-semibold">
                                                    {booking.trip_id?.vehicle_id?.service_type || "Bus Service"}
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600 text-sm">
                                                    {booking.trip_id?.route_id?.routeName || "Route Info"}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium mr-2">
                                                    ID: {booking._id.slice(-6).toUpperCase()}
                                                </span>
                                                <span>
                                                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === "CONFIRMED"
                                                        ? "bg-green-100 text-green-800"
                                                        : booking.status === "CANCELLED"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                                        <div>
                                            <div className="flex items-center space-x-3 text-gray-700 mb-2">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                                <span className="font-medium">
                                                    {booking.trip_id?.departure_datetime
                                                        ? new Date(booking.trip_id.departure_datetime).toLocaleDateString()
                                                        : "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3 text-gray-700">
                                                <Clock className="h-5 w-5 text-gray-400" />
                                                <span className="font-medium">
                                                    {booking.trip_id?.departure_datetime
                                                        ? new Date(booking.trip_id.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-3 text-gray-700 mb-2">
                                                <MapPin className="h-5 w-5 text-gray-400" />
                                                <span>Seats: <span className="font-bold">{booking.seat_numbers?.join(", ") || "Active Ticket"}</span></span>
                                            </div>
                                            <div className="flex items-center space-x-3 text-gray-700">
                                                <QrCode className="h-5 w-5 text-gray-400" />
                                                <span>Fare: <span className="font-bold text-green-600">₹{booking.total_fare}</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.status === "CONFIRMED" && (
                                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                            <Link
                                                to={`/tracking/${booking.trip_id?._id}`}
                                                className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Track Bus
                                            </Link>
                                            <Link
                                                to="/booking-confirmation"
                                                state={{ booking: booking }} // Re-use the confirmation page for ticket view
                                                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                View Ticket
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
