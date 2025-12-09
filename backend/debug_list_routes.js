import mongoose from 'mongoose';
import Route from './models/route.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const listRoutes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const routes = await Route.find();
        console.log(`Found ${routes.length} routes.`);

        routes.forEach(r => {
            console.log(`\nROUTE: ${r.routeName} (${r.origin} -> ${r.destination})`);
            console.log("STOPS:");
            r.stops.forEach(s => {
                console.log(` - ${s.name}: [${s.latitude}, ${s.longitude}]`);
            });
        });

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

listRoutes();
