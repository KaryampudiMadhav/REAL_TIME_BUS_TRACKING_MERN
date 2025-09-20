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

    socket.on("location_update", async ({ tripId, location }) => {
      try {
        await Trip.findByIdAndUpdate(tripId, {
          live_location: location,
          last_location_update: new Date(),
          $push: {
            location_history: {
              latitude: location.latitude,
              longitude: location.longitude,
              timestamp: new Date(),
            },
          },
        });
        // Broadcast the new location to all passengers in that trip's room
        io.to(tripId).emit("new_location", { tripId, location });
      } catch (error) {
        console.error("Error updating location:", error);
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
