// // seed-chunk-2.js
// // seed-chunk-1.js
// import mongoose from "mongoose";

// // --- Pre-generate IDs for linking ---
// const vehicleIds = Array.from(
//   { length: 5 },
//   () => new mongoose.Types.ObjectId()
// );
// const routeIds = Array.from({ length: 5 }, () => new mongoose.Types.ObjectId());
// const staffIds = Array.from(
//   { length: 20 },
//   () => new mongoose.Types.ObjectId()
// );

// // Note: This script assumes you have a 'depots' collection seeded with the 50 depots you provided.
// // The `depot_id` fields below use the string IDs ("dep1", "dep16") from your list.

// // ---------------- Vehicles (5) ----------------
// export const vehicles = [
//   {
//     _id: vehicleIds[0],
//     bus_number: "AP37TV1101",
//     service_type: "Super Luxury",
//     total_seats: 48,
//     amenities: ["AC", "WiFi", "Charging Ports"],
//     depot_id: "dep16", // Bhimavaram Depot
//     status: "AVAILABLE",
//   },
//   {
//     _id: vehicleIds[1],
//     bus_number: "AP07EX2202",
//     service_type: "Express",
//     total_seats: 55,
//     amenities: ["Charging Ports"],
//     depot_id: "dep1", // Vijayawada Depot
//     status: "AVAILABLE",
//   },
//   {
//     _id: vehicleIds[2],
//     bus_number: "TS09GA3303",
//     service_type: "Garuda Volvo",
//     total_seats: 44,
//     amenities: ["AC", "WiFi", "TV", "Water Bottle"],
//     depot_id: "dep25", // Hyderabad MGBS Depot
//     status: "IN_MAINTENANCE",
//   },
//   {
//     _id: vehicleIds[3],
//     bus_number: "AP11UD4404",
//     service_type: "Ultra Deluxe",
//     total_seats: 50,
//     amenities: ["AC"],
//     depot_id: "dep11", // Visakhapatnam Depot
//     status: "AVAILABLE",
//   },
//   {
//     _id: vehicleIds[4],
//     bus_number: "AP15PV5505",
//     service_type: "Palle Velugu",
//     total_seats: 60,
//     amenities: [],
//     depot_id: "dep14", // Rajahmundry Depot
//     status: "AVAILABLE",
//   },
// ];

// // ---------------- Routes (5) ----------------
// export const routes = [
//   {
//     _id: routeIds[0],
//     routeName: "Bhimavaram to Hyderabad Super Luxury",
//     origin: "Bhimavaram",
//     destination: "Hyderabad",
//     distance_km: 350,
//     stops: [
//       {
//         name: "Bhimavaram Depot",
//         latitude: 16.5449,
//         longitude: 81.5212,
//         arrival_offset_mins: 0,
//         departure_offset_mins: 10,
//       },
//       {
//         name: "Vijayawada Depot",
//         latitude: 16.5062,
//         longitude: 80.648,
//         arrival_offset_mins: 120,
//         departure_offset_mins: 140,
//       },
//       {
//         name: "Suryapet Depot",
//         latitude: 17.1405,
//         longitude: 79.6205,
//         arrival_offset_mins: 240,
//         departure_offset_mins: 245,
//       },
//       {
//         name: "Hyderabad MGBS Depot",
//         latitude: 17.385,
//         longitude: 78.4867,
//         arrival_offset_mins: 420,
//         departure_offset_mins: 420,
//       },
//     ],
//   },
//   {
//     _id: routeIds[1],
//     routeName: "Vijayawada to Visakhapatnam Express",
//     origin: "Vijayawada",
//     destination: "Visakhapatnam",
//     distance_km: 350,
//     stops: [
//       {
//         name: "Vijayawada Depot",
//         latitude: 16.5062,
//         longitude: 80.648,
//         arrival_offset_mins: 0,
//         departure_offset_mins: 10,
//       },
//       {
//         name: "Rajahmundry Depot",
//         latitude: 17.0005,
//         longitude: 81.804,
//         arrival_offset_mins: 180,
//         departure_offset_mins: 195,
//       },
//       {
//         name: "Visakhapatnam Depot",
//         latitude: 17.6868,
//         longitude: 83.2185,
//         arrival_offset_mins: 390,
//         departure_offset_mins: 390,
//       },
//     ],
//   },
//   {
//     _id: routeIds[2],
//     routeName: "Tirupati to Guntur Palle Velugu",
//     origin: "Tirupati",
//     destination: "Guntur",
//     distance_km: 380,
//     stops: [
//       {
//         name: "Tirupati Depot",
//         latitude: 13.6288,
//         longitude: 79.4192,
//         arrival_offset_mins: 0,
//         departure_offset_mins: 10,
//       },
//       {
//         name: "Nellore Depot",
//         latitude: 14.4426,
//         longitude: 79.9865,
//         arrival_offset_mins: 130,
//         departure_offset_mins: 145,
//       },
//       {
//         name: "Ongole Depot",
//         latitude: 15.5057,
//         longitude: 80.0499,
//         arrival_offset_mins: 265,
//         departure_offset_mins: 275,
//       },
//       {
//         name: "Guntur Depot",
//         latitude: 16.3067,
//         longitude: 80.4365,
//         arrival_offset_mins: 400,
//         departure_offset_mins: 400,
//       },
//     ],
//   },
//   {
//     _id: routeIds[3],
//     routeName: "Hyderabad to Bhimavaram Garuda",
//     origin: "Hyderabad",
//     destination: "Bhimavaram",
//     distance_km: 350,
//     stops: [
//       {
//         name: "Hyderabad MGBS Depot",
//         latitude: 17.385,
//         longitude: 78.4867,
//         arrival_offset_mins: 0,
//         departure_offset_mins: 10,
//       },
//       {
//         name: "Suryapet Depot",
//         latitude: 17.1405,
//         longitude: 79.6205,
//         arrival_offset_mins: 180,
//         departure_offset_mins: 185,
//       },
//       {
//         name: "Vijayawada Depot",
//         latitude: 16.5062,
//         longitude: 80.648,
//         arrival_offset_mins: 285,
//         departure_offset_mins: 300,
//       },
//       {
//         name: "Bhimavaram Depot",
//         latitude: 16.5449,
//         longitude: 81.5212,
//         arrival_offset_mins: 420,
//         departure_offset_mins: 420,
//       },
//     ],
//   },
//   {
//     _id: routeIds[4],
//     routeName: "Kakinada to Vijayawada Ultra Deluxe",
//     origin: "Kakinada",
//     destination: "Vijayawada",
//     distance_km: 210,
//     stops: [
//       {
//         name: "Kakinada Depot",
//         latitude: 16.9891,
//         longitude: 82.2475,
//         arrival_offset_mins: 0,
//         departure_offset_mins: 5,
//       },
//       {
//         name: "Rajahmundry Depot",
//         latitude: 17.0005,
//         longitude: 81.804,
//         arrival_offset_mins: 60,
//         departure_offset_mins: 70,
//       },
//       {
//         name: "Vijayawada Depot",
//         latitude: 16.5062,
//         longitude: 80.648,
//         arrival_offset_mins: 250,
//         departure_offset_mins: 250,
//       },
//     ],
//   },
// ];

// // ---------------- Trips (10) ----------------
// export const trips = [
//   // A trip currently in transit
//   {
//     _id: new mongoose.Types.ObjectId(),
//     route_id: routeIds[0], // Bhimavaram - Hyderabad
//     vehicle_id: vehicles[0], // Super Luxury
//     driver_id: staffIds[0],
//     conductor_id: staffIds[1],
//     departure_datetime: new Date("2025-09-17T07:00:00Z"), // Departs tomorrow morning
//     arrival_datetime: new Date("2025-09-17T14:00:00Z"),
//     status: "IN_TRANSIT",
//     live_location: { latitude: 16.51, longitude: 80.65 }, // Just left Vijayawada
//     last_location_update: new Date(),
//     current_passenger_count: 38,
//     visited_stops: [
//       {
//         stop_name: "Bhimavaram Depot",
//         actual_arrival_time: new Date("2025-09-17T06:55:00Z"),
//         actual_departure_time: new Date("2025-09-17T07:05:00Z"),
//       },
//       {
//         stop_name: "Vijayawada Depot",
//         actual_arrival_time: new Date("2025-09-17T09:02:00Z"),
//         actual_departure_time: new Date("2025-09-17T09:20:00Z"),
//       },
//     ],
//   },
//   // A scheduled trip for the future
//   {
//     _id: new mongoose.Types.ObjectId(),
//     route_id: routeIds[1], // Vijayawada - Visakhapatnam
//     vehicle_id: vehicles[1], // Express
//     driver_id: staffIds[2],
//     conductor_id: staffIds[3],
//     departure_datetime: new Date("2025-09-18T08:00:00Z"), // Departs day after tomorrow
//     arrival_datetime: new Date("2025-09-18T14:30:00Z"),
//     status: "SCHEDULED",
//     live_location: null,
//     last_location_update: null,
//     current_passenger_count: 15, // Pre-booked seats
//     visited_stops: [],
//   },
//   // A completed trip
//   {
//     _id: new mongoose.Types.ObjectId(),
//     route_id: routeIds[2], // Tirupati - Guntur
//     vehicle_id: vehicles[4], // Palle Velugu
//     driver_id: staffIds[4],
//     conductor_id: staffIds[5],
//     departure_datetime: new Date("2025-09-16T05:00:00Z"), // Departed this morning
//     arrival_datetime: new Date("2025-09-16T11:40:00Z"),
//     status: "COMPLETED",
//     live_location: { latitude: 16.3067, longitude: 80.4365 }, // Final location
//     last_location_update: new Date("2025-09-16T11:42:00Z"),
//     current_passenger_count: 0,
//     visited_stops: [
//       {
//         stop_name: "Tirupati Depot",
//         actual_arrival_time: new Date("2025-09-16T04:58:00Z"),
//         actual_departure_time: new Date("2025-09-16T05:10:00Z"),
//       },
//       {
//         stop_name: "Nellore Depot",
//         actual_arrival_time: new Date("2025-09-16T07:15:00Z"),
//         actual_departure_time: new Date("2025-09-16T07:25:00Z"),
//       },
//       {
//         stop_name: "Ongole Depot",
//         actual_arrival_time: new Date("2025-09-16T09:25:00Z"),
//         actual_departure_time: new Date("2025-09-16T09:35:00Z"),
//       },
//       {
//         stop_name: "Guntur Depot",
//         actual_arrival_time: new Date("2025-09-16T11:41:00Z"),
//         actual_departure_time: new Date("2025-09-16T11:41:00Z"),
//       },
//     ],
//   },
//   // Another in-transit trip
//   {
//     _id: new mongoose.Types.ObjectId(),
//     route_id: routeIds[3], // Hyderabad - Bhimavaram
//     vehicle_id: vehicles[0],
//     driver_id: staffIds[6],
//     conductor_id: staffIds[7],
//     departure_datetime: new Date("2025-09-16T22:00:00Z"), // Departed tonight
//     arrival_datetime: new Date("2025-09-17T05:00:00Z"),
//     status: "IN_TRANSIT",
//     live_location: { latitude: 17.385, longitude: 78.4867 }, // Just left Hyderabad
//     last_location_update: new Date(),
//     current_passenger_count: 42,
//     visited_stops: [
//       {
//         stop_name: "Hyderabad MGBS Depot",
//         actual_arrival_time: new Date("2025-09-16T21:55:00Z"),
//         actual_departure_time: new Date("2025-09-16T22:05:00Z"),
//       },
//     ],
//   },
//   // Another scheduled trip
//   {
//     _id: new mongoose.Types.ObjectId(),
//     route_id: routeIds[4], // Kakinada - Vijayawada
//     vehicle_id: vehicles[3],
//     driver_id: staffIds[8],
//     conductor_id: staffIds[9],
//     departure_datetime: new Date("2025-09-17T10:00:00Z"), // Departs tomorrow
//     arrival_datetime: new Date("2025-09-17T14:10:00Z"),
//     status: "SCHEDULED",
//     live_location: null,
//     last_location_update: null,
//     current_passenger_count: 5,
//     visited_stops: [],
//   },
// ];

// seed-chunk-3.js
import mongoose from "mongoose";
// Import the "key ring" of depot ObjectIDs
import { depotIds } from "./depos.data.js";
// --- Pre-generate IDs for linking ---
const vehicleIds = Array.from(
  { length: 5 },
  () => new mongoose.Types.ObjectId()
);
const routeIds = Array.from({ length: 5 }, () => new mongoose.Types.ObjectId());
const staffIds = Array.from(
  { length: 20 },
  () => new mongoose.Types.ObjectId()
);

// ---------------- Vehicles (5) ----------------
export const vehicles = [
  {
    _id: vehicleIds[0],
    bus_number: "AP03TV1212",
    service_type: "Super Luxury",
    total_seats: 48,
    amenities: ["AC", "Charging Ports"],
    depot_id: depotIds.chittoor, // <-- Corrected ObjectId reference
    status: "AVAILABLE",
  },
  {
    _id: vehicleIds[1],
    bus_number: "AP13EX3434",
    service_type: "Express",
    total_seats: 55,
    amenities: ["Charging Ports"],
    depot_id: depotIds.srikakulam, // <-- Corrected ObjectId reference
    status: "AVAILABLE",
  },
  {
    _id: vehicleIds[2],
    bus_number: "TS10PV5656",
    service_type: "Palle Velugu",
    total_seats: 60,
    amenities: [],
    depot_id: depotIds.khammam, // <-- Corrected ObjectId reference
    status: "ON_TRIP",
  },
  {
    _id: vehicleIds[3],
    bus_number: "AP22GA7878",
    service_type: "Garuda Volvo",
    total_seats: 44,
    amenities: ["AC", "WiFi", "TV"],
    depot_id: depotIds.madanapalle, // <-- Corrected ObjectId reference
    status: "AVAILABLE",
  },
  {
    _id: vehicleIds[4],
    bus_number: "TS30SL9090",
    service_type: "Super Luxury",
    total_seats: 50,
    amenities: ["AC", "Push-back Seats"],
    depot_id: depotIds.karimnagar, // <-- Corrected ObjectId reference
    status: "AVAILABLE",
  },
];

// ---------------- Routes (5) ----------------
export const routes = [
  {
    _id: routeIds[0],
    routeName: "Chittoor to Hindupur Express",
    origin: "Chittoor",
    destination: "Hindupur",
    distance_km: 250,
    stops: [
      {
        name: "Chittoor Depot",
        latitude: 13.2172,
        longitude: 79.1003,
        arrival_offset_mins: 0,
        departure_offset_mins: 10,
      },
      {
        name: "Madanapalle Depot",
        latitude: 13.5503,
        longitude: 78.501,
        arrival_offset_mins: 120,
        departure_offset_mins: 130,
      },
      {
        name: "Anantapur Depot",
        latitude: 14.6819,
        longitude: 77.605,
        arrival_offset_mins: 240,
        departure_offset_mins: 250,
      },
      {
        name: "Hindupur Depot",
        latitude: 13.8289,
        longitude: 77.4914,
        arrival_offset_mins: 330,
        departure_offset_mins: 330,
      },
    ],
  },
  {
    _id: routeIds[1],
    routeName: "Srikakulam to Kakinada Coastal",
    origin: "Srikakulam",
    destination: "Kakinada",
    distance_km: 200,
    stops: [
      {
        name: "Srikakulam Depot",
        latitude: 18.2969,
        longitude: 83.8973,
        arrival_offset_mins: 0,
        departure_offset_mins: 10,
      },
      {
        name: "Vizianagaram Depot",
        latitude: 18.113,
        longitude: 83.3966,
        arrival_offset_mins: 70,
        departure_offset_mins: 75,
      },
      {
        name: "Visakhapatnam Depot",
        latitude: 17.6868,
        longitude: 83.2185,
        arrival_offset_mins: 150,
        departure_offset_mins: 165,
      },
      {
        name: "Kakinada Depot",
        latitude: 16.9891,
        longitude: 82.2475,
        arrival_offset_mins: 270,
        departure_offset_mins: 270,
      },
    ],
  },
  {
    _id: routeIds[2],
    routeName: "Warangal to Karimnagar Palle Velugu",
    origin: "Warangal",
    destination: "Karimnagar",
    distance_km: 75,
    stops: [
      {
        name: "Warangal Depot",
        latitude: 17.9784,
        longitude: 79.5941,
        arrival_offset_mins: 0,
        departure_offset_mins: 5,
      },
      {
        name: "Hanamkonda Depot",
        latitude: 17.9939,
        longitude: 79.5583,
        arrival_offset_mins: 15,
        departure_offset_mins: 20,
      },
      {
        name: "Karimnagar Depot",
        latitude: 18.4386,
        longitude: 79.1288,
        arrival_offset_mins: 90,
        departure_offset_mins: 90,
      },
    ],
  },
  {
    _id: routeIds[3],
    routeName: "Karimnagar to Nizamabad Deluxe",
    origin: "Karimnagar",
    destination: "Nizamabad",
    distance_km: 150,
    stops: [
      {
        name: "Karimnagar Depot",
        latitude: 18.4386,
        longitude: 79.1288,
        arrival_offset_mins: 0,
        departure_offset_mins: 5,
      },
      {
        name: "Siricilla Depot",
        latitude: 18.3886,
        longitude: 78.8092,
        arrival_offset_mins: 50,
        departure_offset_mins: 55,
      },
      {
        name: "Kamareddy Depot",
        latitude: 18.3166,
        longitude: 78.344,
        arrival_offset_mins: 110,
        departure_offset_mins: 115,
      },
      {
        name: "Nizamabad Depot",
        latitude: 18.6725,
        longitude: 78.0941,
        arrival_offset_mins: 180,
        departure_offset_mins: 180,
      },
    ],
  },
  {
    _id: routeIds[4],
    routeName: "Nalgonda to Guntur Express",
    origin: "Nalgonda",
    destination: "Guntur",
    distance_km: 150,
    stops: [
      {
        name: "Nalgonda Depot",
        latitude: 17.0575,
        longitude: 79.2674,
        arrival_offset_mins: 0,
        departure_offset_mins: 10,
      },
      {
        name: "Miryalaguda Depot",
        latitude: 16.873,
        longitude: 79.5655,
        arrival_offset_mins: 50,
        departure_offset_mins: 55,
      },
      {
        name: "Guntur Depot",
        latitude: 16.3067,
        longitude: 80.4365,
        arrival_offset_mins: 180,
        departure_offset_mins: 180,
      },
    ],
  },
];

// ---------------- Trips (10) ----------------
export const trips = [
  // A trip currently in transit
  {
    _id: new mongoose.Types.ObjectId(),
    route_id: routeIds[0], // Chittoor - Hindupur
    vehicle_id: vehicles[0], // Super Luxury
    driver_id: staffIds[0],
    conductor_id: staffIds[1],
    departure_datetime: new Date("2025-09-17T11:00:00Z"),
    arrival_datetime: new Date("2025-09-17T16:30:00Z"),
    status: "IN_TRANSIT",
    live_location: { latitude: 13.56, longitude: 78.51 }, // Near Madanapalle
    last_location_update: new Date(),
    current_passenger_count: 42,
    visited_stops: [
      {
        stop_name: "Chittoor Depot",
        actual_arrival_time: new Date("2025-09-17T10:55:00Z"),
        actual_departure_time: new Date("2025-09-17T11:05:00Z"),
      },
    ],
  },
  // A delayed trip
  {
    _id: new mongoose.Types.ObjectId(),
    route_id: routeIds[1], // Srikakulam - Kakinada
    vehicle_id: vehicles[1], // Express
    driver_id: staffIds[2],
    conductor_id: staffIds[3],
    departure_datetime: new Date("2025-09-17T09:00:00Z"),
    arrival_datetime: new Date("2025-09-17T13:30:00Z"),
    status: "DELAYED",
    live_location: { latitude: 17.7, longitude: 83.22 }, // Approaching Visakhapatnam, but behind schedule
    last_location_update: new Date(),
    current_passenger_count: 50,
    visited_stops: [
      {
        stop_name: "Srikakulam Depot",
        actual_arrival_time: new Date("2025-09-17T08:58:00Z"),
        actual_departure_time: new Date("2025-09-17T09:10:00Z"),
      },
      {
        stop_name: "Vizianagaram Depot",
        actual_arrival_time: new Date("2025-09-17T10:45:00Z"),
        actual_departure_time: new Date("2025-09-17T10:50:00Z"),
      },
    ],
  },
  // A short, local trip that is completed
  {
    _id: new mongoose.Types.ObjectId(),
    route_id: routeIds[2], // Warangal - Karimnagar
    vehicle_id: vehicles[2], // Palle Velugu
    driver_id: staffIds[4],
    conductor_id: staffIds[5],
    departure_datetime: new Date("2025-09-17T08:30:00Z"),
    arrival_datetime: new Date("2025-09-17T10:00:00Z"),
    status: "COMPLETED",
    live_location: { latitude: 18.4386, longitude: 79.1288 }, // Final location
    last_location_update: new Date("2025-09-17T10:02:00Z"),
    current_passenger_count: 0,
    visited_stops: [
      {
        stop_name: "Warangal Depot",
        actual_arrival_time: new Date("2025-09-17T08:30:00Z"),
        actual_departure_time: new Date("2025-09-17T08:35:00Z"),
      },
      {
        stop_name: "Hanamkonda Depot",
        actual_arrival_time: new Date("2025-09-17T08:55:00Z"),
        actual_departure_time: new Date("2025-09-17T09:00:00Z"),
      },
      {
        stop_name: "Karimnagar Depot",
        actual_arrival_time: new Date("2025-09-17T10:01:00Z"),
        actual_departure_time: new Date("2025-09-17T10:01:00Z"),
      },
    ],
  },
];
