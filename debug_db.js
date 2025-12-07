import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Staff from './backend/models/staff.model.js';
import Trip from './backend/models/trip.model.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: './backend/.env' });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const staff = await Staff.findOne({ employee_id: 'CON001' });
        if (!staff) {
            console.log('CON001 NOT FOUND');
        } else {
            console.log('CON001 FOUND:', staff._id, staff.role);

            const trips = await Trip.find({ conductor_id: staff._id });
            console.log(`Found ${trips.length} trips for this conductor.`);
            if (trips.length > 0) {
                console.log('Sample Trip status:', trips[0].status);
            }
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
