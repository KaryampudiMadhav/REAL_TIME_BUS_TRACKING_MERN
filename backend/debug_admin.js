import mongoose from "mongoose";
import dotenv from "dotenv";
import Staff from "./models/staff.model.js";
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkAdmin = async () => {
    try {
        console.log("Connecting to MongoDB...", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);

        const admin = await Staff.findOne({ employee_id: "ADMIN001" }).select("+password");
        console.log("Admin found:", admin ? "YES" : "NO");

        if (admin) {
            console.log("Role:", admin.role);
            console.log("Is Active:", admin.is_active);
            console.log("Stored Hash:", admin.password);

            const isMatch = await bcrypt.compare("password123", admin.password);
            console.log("Password 'password123' matches:", isMatch);
        } else {
            // List all staff to see what's there
            const allStaff = await Staff.find({});
            console.log("All Staff IDs:", allStaff.map(s => s.employee_id));
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkAdmin();
