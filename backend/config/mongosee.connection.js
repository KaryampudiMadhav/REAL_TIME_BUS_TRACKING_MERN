// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB cluster
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If connection is successful, log it to the console
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If there's an error, log the error and exit the process
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
