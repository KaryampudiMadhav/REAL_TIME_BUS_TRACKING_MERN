import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { routes } from "./routes/user.routes.js";
import connectDB from "./config/mongosee.connection.js";
import adminRoutesRouter from "./routes/adminRoutes.routes.js";
import tripRouter from "./routes/adminTrip.routes.js";
import staffRouter from "./routes/staff.routes.js";
import statsRouter from "./routes/stats.routes.js";
import supportRouter from "./routes/support.routes.js";
import vehicleRouter from "./routes/Vehicle.routes.js";
import { Server } from "socket.io";
import http from "http";
import { initializeSocketIO } from "./sockets/socketHandler.js";
import conductorRouter from "./routes/conductor.routes.js";
import issueRouter from "./routes/issue.routes.js";
import muncipalRouter from "./routes/muncipal.routes.js";
import orsmRouter from "./routes/orsm.routes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.APP_URL,
    methods: ["GET", "POST"],
  },
});

app.use("/api/auth", routes);
app.use("/api/admin-routes", adminRoutesRouter);
app.use("/api/admin-trips", tripRouter);
app.use("/api/staff", staffRouter);
app.use("/api/stats", statsRouter);
app.use("/api/support", supportRouter);
app.use("/api/vehicle", vehicleRouter);
app.use("/api/conductor", conductorRouter);
app.use("/api/issue", issueRouter);
app.use("/api/municipal", muncipalRouter);
app.use("/api/estimatedtime", orsmRouter);
initializeSocketIO(io); // 2. Call the function and pass it the 'io' instance

server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
