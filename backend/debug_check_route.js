import mongoose from 'mongoose';
import Route from './models/route.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkRoute = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Find route with destination Visakhapatnam or similar
        const routes = await Route.find({
            $or: [
                { destination: /Visakhapatnam/i },
                { destination: /Vizag/i },
                { origin: /Vijayawada/i }
            ]
        });

        console.log(`Found ${routes.length} routes.`);

        routes.forEach(r => {
            console.log(`\nRoute: ${r.routeName} (${r.origin} -> ${r.destination})`);
            console.log("Stops:", r.stops.map(s => `${s.name} [${s.latitude}, ${s.longitude}]`));
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.connection.close();
    }
};

checkRoute();
