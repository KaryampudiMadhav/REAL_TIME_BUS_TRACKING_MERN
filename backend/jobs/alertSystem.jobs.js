import cron from "node-cron";
import Trip from "../models/trip.model.js";
import Depot from "../models/Depot.model.js";
import IssueReport from "../models/IssueReport.model.js";

export const AlertSystem = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("Running stalled bus check...");
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    try {
      const stalledTrips = await Trip.find({
        status: "IN_TRANSIT",
        last_location_update: { $lt: thirtyMinutesAgo },
      });

      for (const trip of stalledTrips) {
        const recentReport = await IssueReport.findOne({
          trip_id: trip._id,
          createdAt: { $gte: thirtyMinutesAgo },
        });

        if (!recentReport) {
          const nearestDepot = await Depot.findOne({
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [
                    trip.live_location.longitude,
                    trip.live_location.latitude,
                  ],
                },
              },
            },
          });

          // Create an issue report for admin panel
          await IssueReport.create({
            trip_id: trip._id,
            reported_by_staff_id: null, // System-generated, no staff
            issue_type: "BREAKDOWN",
            message: `Bus stalled for over 30 minutes. Nearest depot: ${nearestDepot?.name || "Unknown"
              }.`,
            status: "NEW",
          });
          console.log(
            `ALERT: Bus on trip ${trip._id} is stalled! Issue reported for admin panel.`
          );
        }
      }
    } catch (error) {
      console.error("Error in alert system:", error);
    }
  });
};
