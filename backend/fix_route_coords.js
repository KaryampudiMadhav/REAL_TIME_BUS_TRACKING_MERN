import mongoose from 'mongoose';
import Route from './models/route.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixRoutes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Fix Vijayawada -> Visakhapatnam
        const vzaToVizag = await Route.findOne({
            origin: "Vijayawada",
            destination: "Visakhapatnam"
        });

        if (vzaToVizag) {
            console.log("Found Vijayawada -> Visakhapatnam. Updating stops...");
            vzaToVizag.stops = [
                {
                    name: "Vijayawada",
                    latitude: 16.5062,
                    longitude: 80.6480,
                    arrival_offset_mins: 0,
                    departure_offset_mins: 0
                },
                {
                    name: "Eluru",
                    latitude: 16.7107,
                    longitude: 81.0952,
                    arrival_offset_mins: 60,
                    departure_offset_mins: 65
                },
                {
                    name: "Rajahmundry",
                    latitude: 17.0005,
                    longitude: 81.8040,
                    arrival_offset_mins: 150,
                    departure_offset_mins: 160
                },
                {
                    name: "Visakhapatnam",
                    latitude: 17.6868,
                    longitude: 83.2185,
                    arrival_offset_mins: 360,
                    departure_offset_mins: 360
                }
            ];
            // Update distance roughly
            vzaToVizag.distance_km = 350;
            await vzaToVizag.save();
            console.log("Updated Vijayawada -> Visakhapatnam");
        } else {
            console.log("Route Vijayawada -> Visakhapatnam not found.");
        }

        // 2. Fix Visakhapatnam -> Vijayawada (Return)
        const vizagToVza = await Route.findOne({
            origin: "Visakhapatnam",
            destination: "Vijayawada"
        });

        if (vizagToVza) {
            console.log("Found Visakhapatnam -> Vijayawada. Updating stops...");
            vizagToVza.stops = [
                {
                    name: "Visakhapatnam",
                    latitude: 17.6868,
                    longitude: 83.2185,
                    arrival_offset_mins: 0,
                    departure_offset_mins: 0
                },
                {
                    name: "Rajahmundry",
                    latitude: 17.0005,
                    longitude: 81.8040,
                    arrival_offset_mins: 210,
                    departure_offset_mins: 220
                },
                {
                    name: "Eluru",
                    latitude: 16.7107,
                    longitude: 81.0952,
                    arrival_offset_mins: 300,
                    departure_offset_mins: 305
                },
                {
                    name: "Vijayawada",
                    latitude: 16.5062,
                    longitude: 80.6480,
                    arrival_offset_mins: 360,
                    departure_offset_mins: 360
                }
            ];
            vizagToVza.distance_km = 350;
            await vizagToVza.save();
            console.log("Updated Visakhapatnam -> Vijayawada");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.connection.close();
    }
};

fixRoutes();
