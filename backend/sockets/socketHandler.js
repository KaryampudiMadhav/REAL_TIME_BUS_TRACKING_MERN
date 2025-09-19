import Trip from "../models/trip.model.js";

export const initializeSocketIO = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join_trip_room", (tripId) => {
      socket.join(tripId);
      console.log(`Socket ${socket.id} joined room for trip ${tripId}`);
    });

    socket.on("location_update", async ({ tripId, location }) => {
      try {
        await Trip.findByIdAndUpdate(
          tripId,
          {
            live_location: location,
            last_location_update: new Date(),
            $push: {
              location_history: {
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: new Date(),
              },
            },
          }
        );
        io.to(tripId).emit("new_location", { tripId, location });
      } catch (error) {
        console.error("Error updating location:", error);
      }
    });
    socket.on("join_admin_room", () => {
      socket.join("admin_notifications");
      console.log(`Admin ${socket.id} joined the notification room.`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
