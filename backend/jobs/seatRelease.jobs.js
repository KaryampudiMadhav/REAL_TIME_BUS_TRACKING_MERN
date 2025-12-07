import cron from "node-cron";
import Trip from "../models/trip.model.js";

export const SeatReleaseSystem = (io) => {
  // Run every minute to check for expired seat holds
  cron.schedule("* * * * *", async () => {
    console.log("Running seat release check...");
    const now = new Date();

    try {
      // Find all trips with expired held seats
      const trips = await Trip.find({
        held_seats: {
          $elemMatch: {
            expires_at: { $lte: now },
          },
        },
      });

      for (const trip of trips) {
        // Get expired holds
        const expiredHolds = trip.held_seats.filter(
          (hold) => hold.expires_at <= now
        );

        // Get remaining valid holds
        trip.held_seats = trip.held_seats.filter(
          (hold) => hold.expires_at > now
        );

        // Save the updated trip
        await trip.save();

        // Notify all users in the seat selection room
        const roomName = `seat_selection_${trip._id}`;
        io.to(roomName).emit("seat_status_update", {
          tripId: trip._id,
          heldSeats: trip.held_seats.reduce((acc, hold) => {
            acc.push(...hold.seat_numbers);
            return acc;
          }, []),
        });

        console.log(
          `Released ${expiredHolds.length} expired seat holds for trip ${trip._id}`
        );
      }
    } catch (error) {
      console.error("Error in seat release job:", error);
    }
  });
};
