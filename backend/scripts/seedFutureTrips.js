import mongoose from "mongoose";
import dotenv from "dotenv";
import Trip from "../models/trip.model.js";
import Route from "../models/route.model.js";
import Vehicle from "../models/vehicle.model.js";
import Staff from "../models/staff.model.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const seedFutureTrips = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing FUTURE/SCHEDULED trips to avoid duplicates if re-run?
        // Or just append? Let's just append but check for duplicates.

        const routes = await Route.find();
        if (routes.length === 0) {
            console.log("No routes found. Cannot seed trips.");
            process.exit();
        }

        const vehicles = await Vehicle.find(); // Use all vehicles?
        // For realistic seeding, assign vehicles to routes.
        // We will just create 1 trip per route per day for the next 30 days.

        // Simple strategy:
        // For each Route, pick a random Vehicle and Driver/Conductor.
        // Create a trip for everyday at 09:00 AM.

        const staff = await Staff.find({ role: "DRIVER" });
        const conductors = await Staff.find({ role: "CONDUCTOR" });

        if (staff.length === 0 || conductors.length === 0) {
            console.log("Not enough staff to seed.");
            process.exit();
        }

        const today = new Date();
        const DAYS_TO_SEED = 30;

        let totalCreated = 0;

        for (let i = 0; i < DAYS_TO_SEED; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            date.setHours(9, 0, 0, 0); // 9 AM Departure

            for (const route of routes) {
                // Pick random assests
                const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
                const driver = staff[Math.floor(Math.random() * staff.length)];
                const conductor = conductors[Math.floor(Math.random() * conductors.length)];

                // Check if trip exists
                const sOfDay = new Date(date).setHours(0, 0, 0, 0);
                const eOfDay = new Date(date).setHours(23, 59, 59, 999);

                const existing = await Trip.findOne({
                    route_id: route._id,
                    departure_datetime: { $gte: sOfDay, $lte: eOfDay }
                });

                if (existing) {
                    // console.log(`Trip already exists for route ${route.routeName} on ${date.toDateString()}`);
                    continue;
                }

                // Create Trip
                const arrival_datetime = new Date(date);
                const routeDuration = route.stops[route.stops.length - 1].arrival_offset_mins;
                arrival_datetime.setMinutes(arrival_datetime.getMinutes() + routeDuration);

                await Trip.create({
                    route_id: route._id,
                    vehicle_id: vehicle._id,
                    driver_id: driver._id,
                    conductor_id: conductor._id,
                    departure_datetime: date,
                    arrival_datetime: arrival_datetime,
                    seat_allocation: {
                        online: vehicle.total_seats - 10, // heuristic
                        offline: 10
                    },
                    status: "SCHEDULED"
                });
                totalCreated++;
            }
        }

        console.log(`Seeding complete. Created ${totalCreated} new trips.`);
        process.exit();
    } catch (error) {
        console.error("Error seeding trips:", error);
        process.exit(1);
    }
};

seedFutureTrips();
