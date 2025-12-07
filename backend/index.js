import express from "express";
import logger from "./utils/logger.js";
import apiLimiter from "./utils/rateLimiter.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { routes } from "./routes/user.routes.js";
import connectDB from "./config/mongosee.connection.js";
import adminRoutesRouter from "./routes/adminRoutes.routes.js";
import adminDashboardRouter from "./routes/adminDashboard.routes.js";
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
import couponRouter from "./routes/coupon.routes.js";
import { AlertSystem } from "./jobs/alertSystem.jobs.js";
import { SeatReleaseSystem } from "./jobs/seatRelease.jobs.js";
import bookingRouter from "./routes/booking.routes.js";
import passengerRouter from "./routes/passenger.routes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

AlertSystem();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigin = process.env.APP_URL;
      if (!origin) return callback(null, true);

      // Normalize origins for comparison
      const normalize = (url) => url ? url.replace(/\/$/, "") : "";
      const normalizedOrigin = normalize(origin);
      const normalizedAllowed = normalize(allowedOrigin);

      // Allow:
      // 1. Exact match with APP_URL
      // 2. Localhost (dev)
      // 3. Any Vercel preview deployment
      if (
        normalizedOrigin === normalizedAllowed ||
        normalizedOrigin === "http://localhost:5173" ||
        normalizedOrigin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS. Origin:", origin, "Allowed:", allowedOrigin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
app.set("socketio", io); // Make io accessible in routes
SeatReleaseSystem(io);

// Required for Render (or any proxy) to correctly identify client IPs
app.set("trust proxy", 1);

// Debug Logging for Env
console.log("Server Startup - APP_URL:", process.env.APP_URL);

// Robust CORS with trailing slash handling
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigin = process.env.APP_URL;
    if (!origin) return callback(null, true);

    const normalize = (url) => url ? url.replace(/\/$/, "") : "";
    const normalizedOrigin = normalize(origin);
    const normalizedAllowed = normalize(allowedOrigin);

    if (
      normalizedOrigin === normalizedAllowed ||
      normalizedOrigin === "http://localhost:5173" ||
      normalizedOrigin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS. Origin:", origin, "Allowed:", allowedOrigin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));
app.use(express.json());
app.use(cookieParser());

// Debugging Middleware - Log Request Headers & Cookies
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  console.log("Origin:", req.headers.origin);
  console.log("Cookies:", req.cookies);
  next();
});

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);

// Health Check Route
app.get("/", (req, res) => {
  res.send("Bus Tracking API is running successfully!");
});

app.use("/api/auth", routes);
app.use("/api/admin-routes", adminRoutesRouter);
app.use("/api/admin-dashboard", adminDashboardRouter);
app.use("/api/admin-trips", tripRouter);
app.use("/api/staff", staffRouter);
app.use("/api/stats", statsRouter);
app.use("/api/support", supportRouter);
app.use("/api/vehicle", vehicleRouter);
app.use("/api/conductor", conductorRouter);
app.use("/api/issue", issueRouter);
app.use("/api/municipal", muncipalRouter);
app.use("/api/estimatedtime", orsmRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/passenger/trips", passengerRouter); // New Public Route

initializeSocketIO(io);

server.listen(PORT, () => {
  connectDB();
  logger.info(`Server running on port ${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});
