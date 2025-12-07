import React, { useState } from "react";

const SeatLayout = ({ totalSeats, bookedSeats, serviceType, selectedSeats, onSeatSelect }) => {
  // Internal state removed, using props

  const selectSeat = (seatNumber) => {
    if (selectedSeats.length < 5 && !selectedSeats.includes(seatNumber)) {
      onSeatSelect([...selectedSeats, seatNumber]);
    }
  };

  const deselectSeat = (seatNumber) => {
    onSeatSelect(selectedSeats.filter((seat) => seat !== seatNumber));
  };

  const getSeatLayout = (type, total) => {
    switch (type) {
      case "Palle Velugu":
        return { rows: 13, seatsPerRow: 4, layout: "2+2" };
      case "Express":
      case "Ultra Deluxe":
      case "Super Luxury":
        return { rows: 18, seatsPerRow: 4, layout: "2+2" };
      case "Indra AC":
        return { rows: 25, seatsPerRow: 4, layout: "2+2" };
      default:
        return { rows: Math.ceil(total / 4), seatsPerRow: 4, layout: "2+2" };
    }
  };

  const { rows, seatsPerRow } = getSeatLayout(serviceType, totalSeats);

  const handleSeatClick = (seatNumber) => {
    // Ensure checking against string if needed, or numeric. 
    // Best is to check if bookedSeats contains the seatNumber loosely or after conversion.
    // Assuming backend sends strings, we convert seatNumber to string for check if needed OR
    // better: normalize bookedSeats in parent. But let's handle it here for safety.
    if (bookedSeats.some(s => String(s) === String(seatNumber))) return;

    if (selectedSeats.includes(seatNumber)) {
      deselectSeat(seatNumber);
    } else {
      if (selectedSeats.length < 6) {
        selectSeat(seatNumber);
      }
    }
  };

  const getSeatStatus = (seatNumber) => {
    if (bookedSeats.some(s => String(s) === String(seatNumber))) return "booked";
    if (selectedSeats.includes(seatNumber)) return "selected";
    return "available";
  };

  const getSeatStyle = (status) => {
    switch (status) {
      case "booked":
        return "bg-red-500 text-white cursor-not-allowed";
      case "selected":
        return "bg-blue-600 text-white cursor-pointer transform scale-105";
      case "available":
        return "bg-green-100 text-green-800 cursor-pointer hover:bg-green-200 hover:scale-105";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Driver Section */}
      <div className="mb-8">
        <div className="w-16 h-8 bg-gray-800 rounded-t-full mx-auto mb-4"></div>
        <p className="text-center text-sm text-gray-600 mb-6">Driver</p>
      </div>

      {/* Seat Grid */}
      <div className="max-w-md mx-auto overflow-x-auto pb-4">
        <div className="grid gap-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex justify-between items-center">
              {/* Left side seats */}
              <div className="flex space-x-2">
                {Array.from({ length: 2 }).map((_, seatIndex) => {
                  const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                  if (seatNumber > totalSeats) return null;

                  const status = getSeatStatus(seatNumber);
                  return (
                    <button
                      key={seatNumber}
                      onClick={() => handleSeatClick(seatNumber)}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold text-sm transition-all duration-200 ${getSeatStyle(
                        status
                      )}`}
                      disabled={status === "booked"}
                    >
                      {seatNumber}
                    </button>
                  );
                })}
              </div>

              {/* Aisle */}
              <div className="w-6"></div>

              {/* Right side seats */}
              <div className="flex space-x-2">
                {Array.from({ length: 2 }).map((_, seatIndex) => {
                  const seatNumber = rowIndex * seatsPerRow + seatIndex + 3;
                  if (seatNumber > totalSeats) return null;

                  const status = getSeatStatus(seatNumber);
                  return (
                    <button
                      key={seatNumber}
                      onClick={() => handleSeatClick(seatNumber)}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold text-sm transition-all duration-200 ${getSeatStyle(
                        status
                      )}`}
                      disabled={status === "booked"}
                    >
                      {seatNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-sm text-gray-600">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
