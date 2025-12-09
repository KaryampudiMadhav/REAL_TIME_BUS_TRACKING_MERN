import mongoose from 'mongoose';
import Route from './models/route.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixAllRoutes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const routesToFix = [
            {
                origin: "Vijayawada",
                destination: "Visakhapatnam",
                distance: 350,
                stops: [
                    { name: "Vijayawada", lat: 16.5062, lng: 80.6480, arr: 0, dep: 0 },
                    { name: "Eluru", lat: 16.7107, lng: 81.0952, arr: 60, dep: 65 },
                    { name: "Rajahmundry", lat: 17.0005, lng: 81.8040, arr: 150, dep: 160 },
                    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, arr: 360, dep: 360 }
                ]
            },
            {
                origin: "Visakhapatnam",
                destination: "Vijayawada",
                distance: 350,
                stops: [
                    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, arr: 0, dep: 0 },
                    { name: "Rajahmundry", lat: 17.0005, lng: 81.8040, arr: 210, dep: 220 },
                    { name: "Eluru", lat: 16.7107, lng: 81.0952, arr: 300, dep: 305 },
                    { name: "Vijayawada", lat: 16.5062, lng: 80.6480, arr: 360, dep: 360 }
                ]
            },
            {
                origin: "Hyderabad",
                destination: "Bangalore",
                distance: 575,
                stops: [
                    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, arr: 0, dep: 0 },
                    { name: "Kurnool", lat: 15.8281, lng: 78.0373, arr: 180, dep: 190 },
                    { name: "Anantapur", lat: 14.6819, lng: 77.6006, arr: 300, dep: 310 },
                    { name: "Bangalore", lat: 12.9716, lng: 77.5946, arr: 480, dep: 480 }
                ]
            },
            {
                origin: "Bangalore",
                destination: "Hyderabad",
                distance: 575,
                stops: [
                    { name: "Bangalore", lat: 12.9716, lng: 77.5946, arr: 0, dep: 0 },
                    { name: "Anantapur", lat: 14.6819, lng: 77.6006, arr: 170, dep: 180 },
                    { name: "Kurnool", lat: 15.8281, lng: 78.0373, arr: 290, dep: 300 },
                    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, arr: 480, dep: 480 }
                ]
            },
            {
                origin: "Hyderabad",
                destination: "Vijayawada",
                distance: 275,
                stops: [
                    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, arr: 0, dep: 0 },
                    { name: "Suryapet", lat: 17.1439, lng: 79.6239, arr: 120, dep: 130 },
                    { name: "Vijayawada", lat: 16.5062, lng: 80.6480, arr: 240, dep: 240 }
                ]
            },
            {
                origin: "Vijayawada",
                destination: "Hyderabad",
                distance: 275,
                stops: [
                    { name: "Vijayawada", lat: 16.5062, lng: 80.6480, arr: 0, dep: 0 },
                    { name: "Suryapet", lat: 17.1439, lng: 79.6239, arr: 110, dep: 120 },
                    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, arr: 240, dep: 240 }
                ]
            },
            {
                origin: "Hyderabad",
                destination: "Mumbai",
                distance: 700,
                stops: [
                    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, arr: 0, dep: 0 },
                    { name: "Solapur", lat: 17.6599, lng: 75.9064, arr: 300, dep: 315 },
                    { name: "Pune", lat: 18.5204, lng: 73.8567, arr: 540, dep: 555 },
                    { name: "Mumbai", lat: 19.0760, lng: 72.8777, arr: 720, dep: 720 }
                ]
            },
            {
                origin: "Mumbai",
                destination: "Hyderabad",
                distance: 700,
                stops: [
                    { name: "Mumbai", lat: 19.0760, lng: 72.8777, arr: 0, dep: 0 },
                    { name: "Pune", lat: 18.5204, lng: 73.8567, arr: 180, dep: 195 },
                    { name: "Solapur", lat: 17.6599, lng: 75.9064, arr: 420, dep: 435 },
                    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, arr: 720, dep: 720 }
                ]
            }
        ];

        for (const data of routesToFix) {
            const route = await Route.findOne({ origin: data.origin, destination: data.destination });
            if (route) {
                console.log(`Updating ${data.origin} -> ${data.destination}`);
                route.stops = data.stops.map(s => ({
                    name: s.name,
                    latitude: s.lat,
                    longitude: s.lng,
                    arrival_offset_mins: s.arr,
                    departure_offset_mins: s.dep
                }));
                route.distance_km = data.distance;
                await route.save();
                console.log("Success.");
            } else {
                console.log(`Route ${data.origin} -> ${data.destination} NOT FOUND.`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.connection.close();
    }
};

fixAllRoutes();
