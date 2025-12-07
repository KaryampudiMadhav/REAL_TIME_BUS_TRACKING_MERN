import mongoose from "mongoose";
import dotenv from "dotenv";
import Depot from "./models/Depot.model.js";
import Staff from "./models/staff.model.js";
import Vehicle from "./models/vehicle.model.js";
import Route from "./models/route.model.js";
import Trip from "./models/trip.model.js";
import Booking from "./models/booking.model.js"; // Added for analytics data
import bcrypt from "bcryptjs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected!");

        console.log("Clearing existing data...");
        await Depot.deleteMany({});
        await Staff.deleteMany({});
        await Vehicle.deleteMany({});
        await Route.deleteMany({});
        await Trip.deleteMany({});
        await Booking.deleteMany({});

        // 1. Create Depots
        console.log("Creating Depots...");
        const depots = await Depot.create([
            {
                name: "MGBS Hyderabad",
                city: "Hyderabad",
                address: "Gowliguda, Hyderabad, Telangana",
                location: { type: "Point", coordinates: [78.4808, 17.3787] },
            },
            {
                name: "PNBS Vijayawada",
                city: "Vijayawada",
                address: "Krishnalanka, Vijayawada, Andhra Pradesh",
                location: { type: "Point", coordinates: [80.6205, 16.5135] },
            },
        ]);

        const hashedPassword = await bcrypt.hash("password123", 10);

        // 2. Create Staff (Drivers, Conductors, Admins, Municipal)
        console.log("Creating Staff...");

        // Drivers: 15
        const driversData = Array.from({ length: 15 }).map((_, i) => ({
            employee_id: `EMP${String(i + 1).padStart(3, '0')}`,
            role: "DRIVER",
            depot_id: depots[i % 2]._id,
            date_of_joining: new Date("2023-01-01"),
            work_contact_number: `90001${String(i).padStart(5, '0')}`,
            address: { city: i % 2 === 0 ? "Hyderabad" : "Vijayawada" },
            password: hashedPassword,
            license_details: { number: `AP${i}2023${i}`, expiry_date: new Date("2030-01-01") }
        }));
        const drivers = await Staff.create(driversData);
        console.log("Drivers created");

        // Conductors: 15
        const conductorsData = Array.from({ length: 15 }).map((_, i) => ({
            employee_id: `CON${String(i + 1).padStart(3, '0')}`,
            role: "CONDUCTOR",
            depot_id: depots[i % 2]._id,
            date_of_joining: new Date("2023-01-01"),
            work_contact_number: `90002${String(i).padStart(5, '0')}`,
            address: { city: i % 2 === 0 ? "Hyderabad" : "Vijayawada" },
            password: hashedPassword,
        }));
        const conductors = await Staff.create(conductorsData);
        console.log("Conductors created");

        // Admins: 3
        const admins = await Staff.create([
            { employee_id: "ADMIN001", role: "ADMIN", depot_id: depots[0]._id, work_contact_number: "9999999999", password: hashedPassword, date_of_joining: new Date("2022-01-01") },
            { employee_id: "ADMIN002", role: "ADMIN", depot_id: depots[1]._id, work_contact_number: "9999999998", password: hashedPassword, date_of_joining: new Date("2022-01-01") },
            { employee_id: "ADMIN003", role: "ADMIN", depot_id: depots[0]._id, work_contact_number: "9999999997", password: hashedPassword, date_of_joining: new Date("2022-01-01") }
        ]);
        console.log("Admins created");

        // Municipal: 3
        const municipal = await Staff.create([
            { employee_id: "MUN001", role: "MUNICIPAL", depot_id: depots[0]._id, work_contact_number: "8888888881", password: hashedPassword, is_active: true, date_of_joining: new Date("2023-01-01") },
            { employee_id: "MUN002", role: "MUNICIPAL", depot_id: depots[0]._id, work_contact_number: "8888888882", password: hashedPassword, is_active: true, date_of_joining: new Date("2023-01-01") },
            { employee_id: "MUN003", role: "MUNICIPAL", depot_id: depots[1]._id, work_contact_number: "8888888883", password: hashedPassword, is_active: true, date_of_joining: new Date("2023-01-01") }
        ]);
        console.log("Municipal created");

        // 3. Create Vehicles: 30
        console.log("Creating Vehicles...");
        const vehicleTypes = ["Super Luxury", "Indra AC", "Express", "Garuda Plus", "Amaravati", "Rajdhani", "Palle Velugu"];
        const vehiclesData = Array.from({ length: 30 }).map((_, i) => ({
            bus_number: `TS${String(i + 9).padStart(2, '0')}Z${String(1000 + i)}`,
            service_type: vehicleTypes[i % vehicleTypes.length],
            total_seats: [40, 45, 50, 36][i % 4],
            amenities: i % 2 === 0 ? ["AC", "WiFi"] : ["Charging Ports"],
            depot_id: depots[i % 2]._id,
            status: "AVAILABLE", // Will updated via Trip logic implicitly or manually here
            is_active: true
        }));
        const vehicles = await Vehicle.create(vehiclesData);

        // 4. Create Routes
        console.log("Creating Routes...");
        const routeDefinitions = [
            { name: "Hyderabad to Vijayawada", origin: "Hyderabad", dest: "Vijayawada", dist: 275 },
            { name: "Vijayawada to Hyderabad", origin: "Vijayawada", dest: "Hyderabad", dist: 275 },
            { name: "Hyderabad to Bangalore", origin: "Hyderabad", dest: "Bangalore", dist: 570 },
            { name: "Bangalore to Hyderabad", origin: "Bangalore", dest: "Hyderabad", dist: 570 },
            { name: "Hyderabad to Warangal", origin: "Hyderabad", dest: "Warangal", dist: 145 },
            { name: "Warangal to Hyderabad", origin: "Warangal", dest: "Hyderabad", dist: 145 },
            { name: "Vijayawada to Visakhapatnam", origin: "Vijayawada", dest: "Visakhapatnam", dist: 350 },
            { name: "Visakhapatnam to Vijayawada", origin: "Visakhapatnam", dest: "Vijayawada", dist: 350 },
            { name: "Hyderabad to Mumbai", origin: "Hyderabad", dest: "Mumbai", dist: 700 },
            { name: "Mumbai to Hyderabad", origin: "Mumbai", dest: "Hyderabad", dist: 700 }
        ];

        const routes = await Route.create(routeDefinitions.map(def => {
            const duration = Math.round((def.dist / 50) * 60); // 50kmph
            return {
                routeName: def.name,
                origin: def.origin,
                destination: def.dest,
                distance_km: def.dist,
                stops: [
                    { name: def.origin, latitude: 17.3, longitude: 78.4, arrival_offset_mins: 0, departure_offset_mins: 0 },
                    { name: def.dest, latitude: 16.5, longitude: 80.6, arrival_offset_mins: duration, departure_offset_mins: duration }
                ]
            };
        }));

        // 5. Create Trips & Bookings
        console.log("Creating Trips & Bookings...");
        const tripData = [];
        const today = new Date();
        const bookingsData = [];

        // Helper
        const addHours = (d, h) => new Date(d.getTime() + h * 60 * 60 * 1000);
        const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        // Generate 50 trips
        // Mix: 15 In Transit, 20 Scheduled (Future), 15 Completed (Past)

        for (let i = 0; i < 50; i++) {
            const route = routes[i % routes.length];
            const vehicle = vehicles[i % vehicles.length];
            const driver = drivers[i % drivers.length];
            const conductor = conductors[i % conductors.length];

            let status = "SCHEDULED";
            let depart = new Date(today);

            if (i < 15) {
                status = "IN_TRANSIT";
                depart = addHours(today, -randomInt(1, 3)); // Started 1-3 hours ago
                // Set vehicle to ON_TRIP
                await Vehicle.findByIdAndUpdate(vehicle._id, { status: "ON_TRIP" });
            } else if (i < 35) {
                status = "SCHEDULED";
                depart = addHours(today, randomInt(2, 48)); // In next 2-48 hours
            } else {
                status = "COMPLETED";
                depart = addHours(today, -randomInt(24, 168)); // Last 1-7 days
            }

            const duration = Math.round(route.distance_km / 50); // Approx 50km/hr
            const arrive = addHours(depart, duration);

            // Random occupancy
            const capacity = vehicle.total_seats;
            const filled = randomInt(status === "SCHEDULED" ? 0 : 10, capacity);
            const online = Math.floor(filled * 0.6);
            const offline = filled - online;

            tripData.push({
                route_id: route._id,
                vehicle_id: vehicle._id,
                driver_id: driver._id,
                conductor_id: conductor._id,
                departure_datetime: depart,
                arrival_datetime: arrive,
                status: status,
                seat_allocation: { online: Math.floor(capacity * 0.7), offline: Math.ceil(capacity * 0.3) },
                tickets_booked: { online: online, offline: offline },
                booked_seats: Array.from({ length: filled }, (_, idx) => String(idx + 1))
            });

            // Create some dummy bookings for this trip (for analytics)
            if (status !== "SCHEDULED") { // Only create actual bookings for active/past trips
                for (let b = 0; b < online; b++) {
                    bookingsData.push({
                        trip_id: null,
                        temp_trip_index: i,
                        seat_numbers: [String(b + 1)],
                        booking_channel: "ONLINE",
                        total_fare: 500,
                        status: "CONFIRMED",
                        createdAt: addHours(depart, -randomInt(1, 24))
                    });
                }
            }
        }

        const createdTrips = await Trip.create(tripData);

        // Link bookings to created trip IDs
        const finalBookings = bookingsData.map(b => ({
            trip_id: createdTrips[b.temp_trip_index]._id,
            seat_numbers: b.seat_numbers,
            booking_channel: b.booking_channel,
            total_fare: b.total_fare,
            status: b.status,
            createdAt: b.createdAt
        }));

        if (finalBookings.length > 0) {
            await Booking.create(finalBookings);
        }

        console.log("Database seeded successfully!");
        console.log(`Created: ${depots.length} Depots, ${drivers.length} Drivers, ${conductors.length} Conductors, ${municipal.length} Municipal Staff, ${vehicles.length} Vehicles, ${routes.length} Routes, ${createdTrips.length} Trips.`);
        console.log("-----------------------------------");

        console.log("Credentials:");
        console.log("Admin: ADMIN001 / password123");
        console.log("Municipal: MUN001 / password123");
        console.log("Driver: EMP001 / password123");
        console.log("Conductor: CON001 / password123");
        console.log("-----------------------------------");

        process.exit(0);

    } catch (error) {
        console.error("Error seeding:", error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
};

seedDatabase();
