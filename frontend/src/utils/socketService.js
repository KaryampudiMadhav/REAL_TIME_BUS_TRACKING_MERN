/**
 * Socket.IO Configuration and Helper Functions
 * Centralizes socket connection management across the app
 */

import { io } from "socket.io-client";

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:7000";

const socketConfig = {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"],
};

let socketInstance = null;

/**
 * Get or create a singleton socket instance
 * @returns {Socket} - Socket.IO instance
 */
export const getSocket = () => {
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(SOCKET_SERVER_URL, socketConfig);

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  return socketInstance;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Check if socket is connected
 * @returns {boolean} - Connection status
 */
export const isSocketConnected = () => {
  return socketInstance && socketInstance.connected;
};

/**
 * Emit location update to server
 * @param {string} tripId - Trip ID
 * @param {Object} location - Location object
 * @param {number} location.latitude - Latitude
 * @param {number} location.longitude - Longitude
 * @param {number} location.accuracy - Accuracy in meters
 * @param {number} location.speed - Speed in m/s
 */
export const emitLocationUpdate = (tripId, location) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit("location_update", {
      tripId,
      location,
      timestamp: new Date(),
    });
  }
};

/**
 * Join trip tracking room
 * @param {string} tripId - Trip ID to track
 */
export const joinTripRoom = (tripId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit("join_trip_room", tripId);
  }
};

/**
 * Listen for location updates
 * @param {Function} callback - Callback function for location updates
 */
export const onLocationUpdate = (callback) => {
  const socket = getSocket();
  if (socket) {
    socket.on("new_location", callback);
  }
};

/**
 * Emit issue report
 * @param {Object} issue - Issue object
 */
export const reportIssue = (issue) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit("report_issue", issue);
  }
};

/**
 * Emit trip status update
 * @param {string} tripId - Trip ID
 * @param {string} status - Trip status
 */
export const updateTripStatus = (tripId, status) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit("trip_status_update", { tripId, status });
  }
};

export default {
  getSocket,
  disconnectSocket,
  isSocketConnected,
  emitLocationUpdate,
  joinTripRoom,
  onLocationUpdate,
  reportIssue,
  updateTripStatus,
};
