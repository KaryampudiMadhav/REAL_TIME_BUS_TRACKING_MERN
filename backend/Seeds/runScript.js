// seeder.js

import Vehicle from "./../models/vehicle.model.js";
import Route from "./../models/route.model.js";
import Trip from "./../models/trip.model.js";
import { vehicles, routes, trips } from "./full.data.js";
import connectDB from "./../config/mongosee.connection.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { depots } from "./depos.data.js";
import Depot from "./../models/Depot.model.js";
import Staff from "../models/staff.model.js";
import { staff } from "./users.data.js";

// This calculates the correct path to the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
connectDB();

const importData = async () => {
  try {
    // await Depot.insertMany(depots);
    // await Vehicle.insertMany(vehicles);
    // await Route.insertMany(routes);
    // await Trip.insertMany(trips);
    await Staff.insertMany(staff);

    console.log("Data Imported Successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // Clear all data
    await Depot.deleteMany();
    await Vehicle.deleteMany();
    await Route.deleteMany();
    await Trip.deleteMany();

    console.log("Data Destroyed Successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// --- Command Line Logic ---
// This allows you to run "node seeder.js" or "node seeder.js -delse {
importData();
