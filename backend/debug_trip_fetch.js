
import mongoose from 'mongoose';
import Trip from './models/trip.model.js';
import Route from './models/route.model.js';
import Vehicle from './models/vehicle.model.js';
import Staff from './models/staff.model.js';
import User from './models/user.model.js';
import IssueReport from './models/IssueReport.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

const debugGetTrip = async () => {
    await connectDB();

    try {
        // Find *any* trip to start with
        const trip = await Trip.findOne().sort({ createdAt: -1 });
        if (!trip) {
            console.log("No trips found in DB.");
            process.exit(0);
        }

        console.log(`Found Trip ID: ${trip._id}`);

        // Mimic the controller logic EXACTLY
        const fetchedTrip = await Trip.findById(trip._id)
            .populate("route_id")
            .populate("vehicle_id")
            .populate({
                path: "driver_id",
                select: "employee_id work_contact_number",
            })
            .populate({
                path: "conductor_id",
                select: "employee_id work_contact_number",
            });

        console.log("Deep population successful.");

        // Mimic Issue Finding
        const issues = await IssueReport.find({
            trip_id: trip._id,
            status: { $ne: 'RESOLVED' }
        }).sort({ createdAt: -1 });

        console.log(`Found ${issues.length} issues.`);

        const tripObj = fetchedTrip.toObject();
        tripObj.issues = issues;

        console.log("Successfully constructed trip object.");

    } catch (error) {
        console.error("ERROR CAUGHT IN DEBUG SCRIPT:");
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

debugGetTrip();
