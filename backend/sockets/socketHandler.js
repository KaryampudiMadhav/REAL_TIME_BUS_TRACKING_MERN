import Trip from "../models/trip.model.js";

// This is an in-memory store for temporary seat locks. It will reset if the server restarts.
const seatLocks = new Map();

export const initializeSocketIO = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // =================================================================
    // --- Live GPS Tracking Features ---
    // =================================================================
    socket.on("join_trip_room", (tripId) => {
      socket.join(tripId);
      console.log(
        `Socket ${socket.id} joined tracking room for trip ${tripId}`
      );
    });

    socket.on("driver_location_update", async ({ tripId, location, speed }) => {
      try {
        // Validate location data
        if (!tripId || !location || !location.latitude || !location.longitude) {
          console.error("Invalid location data received");
          return;
        }

        const updateData = {
          live_location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          last_location_update: new Date(),
          $push: {
            location_history: {
              latitude: location.latitude,
              longitude: location.longitude,
              timestamp: new Date(),
              speed: speed || 0
            },
          },
        };

        // Update trip with new location
        const updatedTrip = await Trip.findByIdAndUpdate(
          tripId,
          updateData,
          { new: true }
        );

        if (!updatedTrip) {
          console.error(`Trip ${tripId} not found`);
          return;
        }

        // Broadcast the new location to all users following this trip
        io.to(tripId).emit("new_location", {
          tripId,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy || null,
            speed: speed || null,
          },
          timestamp: new Date(),
        });

        // Log for debugging
        console.log(`Location update for trip ${tripId}:`, location);
      } catch (error) {
        console.error("Error updating location:", error);
        socket.emit("location_update_error", {
          message: "Failed to update location",
        });
      }
    });

    // =================================================================
    // --- Real-Time Seat Selection Features ---
    // =================================================================
    socket.on("join_seat_selection", (tripId) => {
      const roomName = `seat_selection_${tripId}`;
      socket.join(roomName);
      console.log(
        `Socket ${socket.id} joined seat selection for trip ${tripId}`
      );
    });

    // Hold seats for 5 minutes during selection
    socket.on("hold_seats", async ({ tripId, seatNumbers, userId }) => {
      try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

        // Add to in-memory seat locks
        const lockKey = `${tripId}-${seatNumbers.join(",")}`;
        seatLocks.set(lockKey, {
          userId,
          expiresAt,
          seatNumbers,
        });

        // Broadcast to all users in the seat selection room
        const roomName = `seat_selection_${tripId}`;
        io.to(roomName).emit("seat_status_update", {
          tripId,
          heldSeats: Array.from(seatLocks.entries())
            .filter(([key]) => key.startsWith(`${tripId}-`))
            .map(([_, value]) => value.seatNumbers)
            .flat(),
        });

        // Set a timeout to release seats after 5 minutes
        setTimeout(() => {
          if (seatLocks.has(lockKey)) {
            seatLocks.delete(lockKey);
            // Broadcast the release
            io.to(roomName).emit("seat_status_update", {
              tripId,
              heldSeats: Array.from(seatLocks.entries())
                .filter(([key]) => key.startsWith(`${tripId}-`))
                .map(([_, value]) => value.seatNumbers)
                .flat(),
            });
          }
        }, 5 * 60 * 1000);
      } catch (error) {
        console.error("Error holding seats:", error);
        socket.emit("seat_hold_error", {
          message: "Failed to hold seats. Please try again.",
        });
      }
    });

    // Release seats manually (e.g., when user navigates away)
    socket.on("release_seats", async ({ tripId, seatNumbers }) => {
      try {
        // Remove from in-memory seat locks
        const lockKey = `${tripId}-${seatNumbers.join(",")}`;
        seatLocks.delete(lockKey);

        // Broadcast to all users in the seat selection room
        const roomName = `seat_selection_${tripId}`;
        io.to(roomName).emit("seat_status_update", {
          tripId,
          heldSeats: Array.from(seatLocks.entries())
            .filter(([key]) => key.startsWith(`${tripId}-`))
            .map(([_, value]) => value.seatNumbers)
            .flat(),
        });
      } catch (error) {
        console.error("Error releasing seats:", error);
      }
    });

    socket.on("lock_seat", ({ tripId, seatNumber }) => {
      const lockKey = `${tripId}-${seatNumber}`;
      if (!seatLocks.has(lockKey)) {
        seatLocks.set(lockKey, { userId: socket.id });
        const roomName = `seat_selection_${tripId}`;
        io.to(roomName).emit("seat_update", { seatNumber, status: "locked" });

        // Automatically release the lock after 5 minutes
        setTimeout(() => {
          if (seatLocks.has(lockKey)) {
            seatLocks.delete(lockKey);
            io.to(roomName).emit("seat_update", {
              seatNumber,
              status: "available",
            });
          }
        }, 300000);
      }
    });

    socket.on("release_seat", ({ tripId, seatNumber }) => {
      const lockKey = `${tripId}-${seatNumber}`;
      if (
        seatLocks.has(lockKey) &&
        seatLocks.get(lockKey).userId === socket.id
      ) {
        seatLocks.delete(lockKey);
        const roomName = `seat_selection_${tripId}`;
        io.to(roomName).emit("seat_update", {
          seatNumber,
          status: "available",
        });
      }
    });

    // =================================================================
    // --- Admin Notification Features ---
    // =================================================================
    socket.on("join_admin_room", () => {
      socket.join("admin_notifications");
      console.log(`Admin ${socket.id} joined the notification room.`);
    });

    // =================================================================
    // --- Disconnect Handler ---
    // =================================================================
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Clean up any seat locks held by the disconnected user
      for (const [key, value] of seatLocks.entries()) {
        if (value.userId === socket.id) {
          const [tripId, seatNumber] = key.split("-");
          seatLocks.delete(key);
          const roomName = `seat_selection_${tripId}`;
          io.to(roomName).emit("seat_update", {
            seatNumber,
            status: "available",
          });
        }
      }
    });
  });
};
