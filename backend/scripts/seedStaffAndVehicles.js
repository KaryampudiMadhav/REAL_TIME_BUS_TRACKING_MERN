
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";

// Models
import User from "../models/user.model.js";
import Staff from "../models/staff.model.js";
import Vehicle from "../models/vehicle.model.js";

// Config: Assume running from backend root
dotenv.config({ path: "../.env" });

console.log("Connecting to DB...");

const sampleIndianNames = [
    "Rajesh Kumar", "Suresh Reddy", "Ramesh Babu", "Venkatesh Rao",
    "Srinivas Yadav", "Nagraj Goud", "Praveen Kumar", "Mahesh Babu",
    "Sunil Shetty", "Vijay Kumar", "Anil Kapoor", "Sanjay Dutt"
];

const busNumbers = [
    "AP21Z", "TS08UB", "TS09UA", "AP29Z", "TS07UC"
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // --- 1. Seed Vehicles ---
        console.log("Seeding Vehicles...");
        const services = ["Super Luxury", "Indra AC", "Garuda Plus", "Palle Velugu", "Express"];
        const createdVehicles = [];

        for (let i = 0; i < 20; i++) {
            const busNum = `${busNumbers[i % 5]}${1000 + i}`;
            const existing = await Vehicle.findOne({ bus_number: busNum });
            if (!existing) {
                const vehicle = await Vehicle.create({
                    bus_number: busNum,
                    service_type: services[i % services.length],
                    total_seats: 40,
                    amenities: ["Wifi", "Charging Point", "Water Bottle"],
                    status: "AVAILABLE",
                    current_location: {
                        lat: 17.3850,
                        lng: 78.4867
                    }
                });
                createdVehicles.push(vehicle);
            } else {
                createdVehicles.push(existing);
            }
        }
        console.log(`Verified/Created ${createdVehicles.length} vehicles.`);


        // --- 2. Seed Staff (Drivers & Conductors) ---
        console.log("Seeding Staff...");
        const passwordHash = await bcryptjs.hash("password123", 10);

        // Create 15 Drivers and 15 Conductors
        for (let i = 0; i < 30; i++) {
            const role = i < 15 ? "DRIVER" : "CONDUCTOR";
            const email = `${role.toLowerCase()}${i + 1}@example.com`;
            const name = sampleIndianNames[i % sampleIndianNames.length] + ` (${role[0]}${i + 1})`;

            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    fullName: name,
                    email,
                    password: passwordHash,
                    contact_number: `98765432${i.toString().padStart(2, '0')}`,
                    isVerified: true
                });
            }

            let staff = await Staff.findOne({ user_id: user._id });
            if (!staff) {
                staff = await Staff.create({
                    user_id: user._id,
                    role: role,
                    employee_id: `${role.substring(0, 3).toUpperCase()}${100 + i}`,
                    license_number: role === "DRIVER" ? `LIC${1000 + i}` : undefined,
                    assigned_vehicle_id: null,
                    status: "AVAILABLE",
                    current_schedule_id: null
                });
                console.log(`Created ${role}: ${name}`);
            }
        }

        console.log("Seeding Complete!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedData();
