import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, MapPin, Clock, User, Phone, Ticket, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const BookingConfirmation = () => {
  const location = useLocation();
  const booking = location.state?.booking;
  const ticketRef = useRef(null);

  // Helper to extract trip ID safely
  const getTripId = (booking) => {
    if (!booking) return null;
    if (booking.trip_id && typeof booking.trip_id === 'object') {
      return booking.trip_id._id;
    }
    return booking.trip_id || booking.tripId;
  };

  const tripId = getTripId(booking);

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BusTicket_${booking.id || 'confirmed'}.pdf`);
      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      console.error("Error generating ticket:", error);
      toast.error("Failed to download ticket");
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Go back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your bus ticket has been booked successfully</p>
        </div>

        {/* Ticket Container for PDF Capture */}
        <div ref={ticketRef} className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">Bus Ticket</h2>
                <p className="text-blue-100">Booking ID: {booking._id || booking.id}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Journey Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      {/* Using trip data if available, else route data from booking */}
                      <p className="font-medium text-gray-800">
                        {booking.trip_id?.route_id?.origin || "Origin"} → {booking.trip_id?.route_id?.destination || "Destination"}
                      </p>
                      <p className="text-sm text-gray-600">Non-stop journey</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {booking.trip_id?.departure_datetime
                          ? new Date(booking.trip_id.departure_datetime).toLocaleString()
                          : new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Passenger Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800">{booking.user_id?.fullName || "Passenger"}</p>
                      <p className="text-sm text-gray-600">Passenger</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800">{booking.user_id?.phone || "Contact Number"}</p>
                      <p className="text-sm text-gray-600">Contact Number</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Seat Numbers</h3>
                  <div className="flex space-x-2">
                    {booking.seat_numbers && booking.seat_numbers.map((seat) => (
                      <span
                        key={seat}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {seat}
                      </span>
                    ))}
                    {(!booking.seat_numbers || booking.seat_numbers.length === 0) && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        General Ticket
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total Fare</p>
                  <p className="text-2xl font-bold text-green-600">₹{booking.total_fare}</p>
                </div>
              </div>
            </div>

            {/* QR Code if available */}
            {booking.qr_code_data && (
              <div className="flex justify-center mt-4 border-t pt-4">
                <img src={booking.qr_code_data} alt="Ticket QR" className="w-32 h-32" />
              </div>
            )}
          </div>

          {/* Boarding Pass Style Bottom */}
          <div className="bg-gray-50 px-6 py-4 border-t border-dashed border-gray-300">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-gray-600">Bus:</span>
                <span className="font-medium ml-1 text-gray-800">{booking.trip_id?.vehicle_id?.bus_number || "Bus 123"}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600 ml-1">Confirmed</span>
              </div>
              <div>
                {/* Dummy Platform */}
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium ml-1 text-gray-800">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-3">Important Instructions</h3>
          <ul className="text-sm text-yellow-700 space-y-2">
            <li>• Please arrive at the boarding point at least 15 minutes before departure</li>
            <li>• Carry a valid ID proof for verification</li>
            <li>• Keep your phone number active for any communication</li>
            <li>• Show the QR code to the conductor while boarding</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownloadTicket}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            Download Ticket
          </button>
          <Link
            to={`/tracking/${tripId}`}
            className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center flex items-center justify-center gap-2 ${!tripId ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <MapPin className="h-5 w-5" />
            Track Your Bus
          </Link>
          <Link
            to="/"
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
          >
            Book Another Ticket
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
