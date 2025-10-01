// // import mongoose from "mongoose";
// // import dotenv from "dotenv";
// // import path from "path";
import Staff from "./../models/staff.model.js";
// // // --- 1. SETUP & DATABASE CONNECTION ---

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(
//     );
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error connecting to DB: ${error.message}`);
//     process.exit(1);
//   }
// };

// // // --- 2. IMPORT YOUR NEW STAFF MODEL ---
// // // Make sure the path to your model file is correct

// // // --- 3. DUMMY DATA (5 Records) ---

// // const staffData = [
// //   // Admin
// //   {
// //     _id: new mongoose.Types.ObjectId(),
// //     employee_id: "ADMIN-001",
// //     role: "ADMIN",
// //     date_of_joining: new Date("2022-01-01"),
// //     is_active: true,
// //     is_on_duty: false,
// //     work_contact_number: "9999999901",
// //     password: "adminpassword123", // Plain text for seeding
// //   },
// //   // Municipal
// //   {
// //     _id: new mongoose.Types.ObjectId(),
// //     employee_id: "MUN-OFFICER-01",
// //     role: "MUNICIPAL",
// //     date_of_joining: new Date("2023-03-15"),
// //     is_active: true,
// //     is_on_duty: false,
// //     work_contact_number: "9999999902",
// //     password: "municipalpassword123", // Plain text for seeding
// //   },
// //   // Driver 1
// //   {
// //     _id: new mongoose.Types.ObjectId(),
// //     employee_id: "D-1031",
// //     role: "DRIVER",
// //     date_of_joining: new Date("2021-06-20"),
// //     is_active: true,
// //     is_on_duty: true,
// //     work_contact_number: "9888888811",
// //     license_details: {
// //       number: "TS-D-1031XYZ",
// //       expiry_date: new Date("2031-06-19"),
// //     },
// //     password: "driverpassword123", // Plain text for seeding
// //   },
// //   // Driver 2
// //   {
// //     _id: new mongoose.Types.ObjectId(),
// //     employee_id: "C-2000",
// //     role: "CONDUCTOR",
// //     date_of_joining: new Date("2020-02-11"),
// //     is_active: true,
// //     is_on_duty: false,
// //     work_contact_number: "9888888812",
// //     license_details: {
// //       number: "AP-D-1032XYZ",
// //       expiry_date: new Date("2030-02-10"),
// //     },
// //     password: "driverpassword123", // Plain text for seeding
// //   },
// //   // Conductor 1
// //   {
// //     _id: new mongoose.Types.ObjectId(),
// //     employee_id: "C-2025",
// //     role: "CONDUCTOR",
// //     date_of_joining: new Date("2023-08-01"),
// //     is_active: true,
// //     is_on_duty: true,
// //     work_contact_number: "9777777715",
// //     password: "conductorpassword123", // Plain text for seeding
// //   },
// // ];

// // // --- 4. SEEDER SCRIPT LOGIC ---

// // const seedStaff = async () => {
// //   await connectDB();

// //   try {
// //     // Clear previous staff to avoid duplicates
// //     await Staff.deleteMany();
// //     console.log("Existing staff cleared.");

// //     // Insert the new staff profiles
// //     await Staff.insertMany(staffData);
// //     console.log("New staff profiles created.");

// //     console.log("--- Seeding Complete ---");
// //     process.exit();
// //   } catch (error) {
// //     console.error(`Seeder Error: ${error}`);
// //     process.exit(1);
// //   }
// // };

// // // Run the seeder function
// // seedStaff();

// // import Staff from "./../models/staff.model.js";
// import bcryptjs from "bcryptjs";
// // --- 1. SETUP & DATABASE CONNECTION ---
// import mongoose from "mongoose";
// import Route from "../models/route.model.js";
// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(
//       "mongodb+srv://karyampudimadhav_db_user:aYnPoEO5JoXvdjB6@busnext.g5d5ecd.mongodb.net/BUSNEXT?retryWrites=true&w=majority&appName=BusNext"
//     );
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error connecting to DB: ${error.message}`);
//     process.exit(1);
//   }
// };

// // // --- 2. IMPORT YOUR NEW STAFF MODEL ---
// // // Make sure the path to your model file is correct

// // // --- 3. DUMMY DATA (5 Records) ---

// // let staffData = [
// //   // Admin
// //   {
// //     _id: new mongoose.Types.ObjectId(),
// //     employee_id: "ADMIN-001",
// //     role: "ADMIN",
// //     date_of_joining: new Date("2022-01-01"),
// //     is_active: true,
// //     is_on_duty: false,
// //     work_contact_number: "9999999901",
// //     password: "adminpassword123", // Plain text for seeding
// //   },
// //   // Municipal
// //   {
// //     _id: new mongoose.Types.ObjectId(),
// //     employee_id: "MUN-OFFICER-01",
// //     role: "MUNICIPAL",
// //     date_of_joining: new Date("2023-03-15"),
// //     is_active: true,
// //     is_on_duty: false,
// //     work_contact_number: "9999999902",
// //     password: "municipalpassword123", // Plain text for seeding
// //   },
// //   // Driver 1
// //   {
// //     _id: new mongoose.Types.ObjectId(),
// //     employee_id: "D-1031",
// //     role: "DRIVER",
// //     date_of_joining: new Date("2021-06-20"),
// //     is_active: true,
// //     is_on_duty: true,
// //     work_contact_number: "9888888811",
// //     license_details: {
// //       number: "TS-D-1031XYZ",
// //       expiry_date: new Date("2031-06-19"),
// //     },
// //     password: "driverpassword123", // Plain text for seeding
// //   },
// //   // Driver 2
// //   {
// //     _id: new mongoose.Types.ObjectId(),
// //     employee_id: "C-2000",
// //     role: "CONDUCTOR",
// //     date_of_joining: new Date("2020-02-11"),
// //     is_active: true,
// //     is_on_duty: false,
// //     work_contact_number: "9888888812",
// //     license_details: {
// //       number: "AP-D-1032XYZ",
// //       expiry_date: new Date("2030-02-10"),
// //     },
// //     password: "driverpassword123", // Plain text for seeding
// //   },
// //   // Conductor 1
// //   {
// //     _id: new mongoose.Types.ObjectId(),
// //     employee_id: "C-2025",
// //     role: "CONDUCTOR",
// //     date_of_joining: new Date("2023-08-01"),
// //     is_active: true,
// //     is_on_duty: true,
// //     work_contact_number: "9777777715",
// //     password: "conductorpassword123", // Plain text for seeding
// //   },
// // ];

// // // --- 4. SEEDER SCRIPT LOGIC ---

// const seedStaff = async () => {
//   await connectDB();

//   try {
//     // Hash passwords before seeding
//     // for (const staff of staffData) {
//     //   staff.password = await bcryptjs.hash(staff.password, 10);
//     // }
//     // Clear previous staff to avoid duplicates
//     // await Staff.deleteMany();
//     // console.log("Existing staff cleared.");

//     // Insert the new staff profiles
//     // await Staff.insertMany(staffData);
//     // console.log("New staff profiles created.");

//     await Route.insertMany(routes);
//     console.log("New depot profiles created.");

//     console.log("--- Seeding Complete ---");
//     process.exit();
//   } catch (error) {
//     console.error(`Seeder Error: ${error}`);
//     process.exit(1);
//   }
// };

// // Run the seeder function
// seedStaff();

// // data/depots.js

// // export const depotIds = {
// //   vijayawada: new mongoose.Types.ObjectId(),
// //   guntur: new mongoose.Types.ObjectId(),
// //   tenali: new mongoose.Types.ObjectId(),
// //   ongole: new mongoose.Types.ObjectId(),
// //   nellore: new mongoose.Types.ObjectId(),
// //   tirupati: new mongoose.Types.ObjectId(),
// //   chittoor: new mongoose.Types.ObjectId(),
// //   kadapa: new mongoose.Types.ObjectId(),
// //   anantapur: new mongoose.Types.ObjectId(),
// //   kurnool: new mongoose.Types.ObjectId(),
// //   visakhapatnam: new mongoose.Types.ObjectId(),
// //   vizianagaram: new mongoose.Types.ObjectId(),
// //   srikakulam: new mongoose.Types.ObjectId(),
// //   rajahmundry: new mongoose.Types.ObjectId(),
// //   kakinada: new mongoose.Types.ObjectId(),
// //   bhimavaram: new mongoose.Types.ObjectId(),
// //   machilipatnam: new mongoose.Types.ObjectId(),
// //   gudivada: new mongoose.Types.ObjectId(),
// //   amalapuram: new mongoose.Types.ObjectId(),
// //   narasapuram: new mongoose.Types.ObjectId(),
// //   proddatur: new mongoose.Types.ObjectId(),
// //   madanapalle: new mongoose.Types.ObjectId(),
// //   hindupur: new mongoose.Types.ObjectId(),
// //   nandyal: new mongoose.Types.ObjectId(),
// //   parvathipuram: new mongoose.Types.ObjectId(),
// //   hyderabadMgbs: new mongoose.Types.ObjectId(),
// //   secunderabadJbs: new mongoose.Types.ObjectId(),
// //   warangal: new mongoose.Types.ObjectId(),
// //   hanamkonda: new mongoose.Types.ObjectId(),
// //   khammam: new mongoose.Types.ObjectId(),
// //   karimnagar: new mongoose.Types.ObjectId(),
// //   nizamabad: new mongoose.Types.ObjectId(),
// //   adilabad: new mongoose.Types.ObjectId(),
// //   mancherial: new mongoose.Types.ObjectId(),
// //   mahbubnagar: new mongoose.Types.ObjectId(),
// //   nalgonda: new mongoose.Types.ObjectId(),
// //   suryapet: new mongoose.Types.ObjectId(),
// //   kodad: new mongoose.Types.ObjectId(),
// //   siddipet: new mongoose.Types.ObjectId(),
// //   medak: new mongoose.Types.ObjectId(),
// //   zaheerabad: new mongoose.Types.ObjectId(),
// //   bhongir: new mongoose.Types.ObjectId(),
// //   jangaon: new mongoose.Types.ObjectId(),
// //   miryalaguda: new mongoose.Types.ObjectId(),
// //   kamareddy: new mongoose.Types.ObjectId(),
// //   bhadrachalam: new mongoose.Types.ObjectId(),
// //   palvoncha: new mongoose.Types.ObjectId(),
// //   kothagudem: new mongoose.Types.ObjectId(),
// //   manuguru: new mongoose.Types.ObjectId(),
// //   siricilla: new mongoose.Types.ObjectId(),
// // };

// // export const depots = [
// //   {
// //     _id: depotIds.vijayawada,
// //     name: "Vijayawada Depot",
// //     city: "Vijayawada",
// //     location: { type: "Point", coordinates: [80.648, 16.5062] },
// //   },
// //   {
// //     _id: depotIds.guntur,
// //     name: "Guntur Depot",
// //     city: "Guntur",
// //     location: { type: "Point", coordinates: [80.435, 16.3142] },
// //   },
// //   {
// //     _id: depotIds.tenali,
// //     name: "Tenali Depot",
// //     city: "Tenali",
// //     location: { type: "Point", coordinates: [80.6406, 16.2417] },
// //   },
// //   {
// //     _id: depotIds.ongole,
// //     name: "Ongole Depot",
// //     city: "Ongole",
// //     location: { type: "Point", coordinates: [80.0499, 15.5057] },
// //   },
// //   {
// //     _id: depotIds.nellore,
// //     name: "Nellore Depot",
// //     city: "Nellore",
// //     location: { type: "Point", coordinates: [79.9865, 14.4426] },
// //   },
// //   {
// //     _id: depotIds.tirupati,
// //     name: "Tirupati Depot",
// //     city: "Tirupati",
// //     location: { type: "Point", coordinates: [79.4192, 13.6288] },
// //   },
// //   {
// //     _id: depotIds.chittoor,
// //     name: "Chittoor Depot",
// //     city: "Chittoor",
// //     location: { type: "Point", coordinates: [79.1003, 13.2172] },
// //   },
// //   {
// //     _id: depotIds.kadapa,
// //     name: "Kadapa Depot",
// //     city: "Kadapa",
// //     location: { type: "Point", coordinates: [78.8296, 14.4673] },
// //   },
// //   {
// //     _id: depotIds.anantapur,
// //     name: "Anantapur Depot",
// //     city: "Anantapur",
// //     location: { type: "Point", coordinates: [77.605, 14.6819] },
// //   },
// //   {
// //     _id: depotIds.kurnool,
// //     name: "Kurnool Depot",
// //     city: "Kurnool",
// //     location: { type: "Point", coordinates: [78.04, 15.8281] },
// //   },
// //   {
// //     _id: depotIds.visakhapatnam,
// //     name: "Visakhapatnam Depot",
// //     city: "Visakhapatnam",
// //     location: { type: "Point", coordinates: [83.2185, 17.6868] },
// //   },
// //   {
// //     _id: depotIds.vizianagaram,
// //     name: "Vizianagaram Depot",
// //     city: "Vizianagaram",
// //     location: { type: "Point", coordinates: [83.3966, 18.113] },
// //   },
// //   {
// //     _id: depotIds.srikakulam,
// //     name: "Srikakulam Depot",
// //     city: "Srikakulam",
// //     location: { type: "Point", coordinates: [83.8973, 18.2969] },
// //   },
// //   {
// //     _id: depotIds.rajahmundry,
// //     name: "Rajahmundry Depot",
// //     city: "Rajahmundry",
// //     location: { type: "Point", coordinates: [81.804, 17.0005] },
// //   },
// //   {
// //     _id: depotIds.kakinada,
// //     name: "Kakinada Depot",
// //     city: "Kakinada",
// //     location: { type: "Point", coordinates: [82.2475, 16.9891] },
// //   },
// //   {
// //     _id: depotIds.bhimavaram,
// //     name: "Bhimavaram Depot",
// //     city: "Bhimavaram",
// //     location: { type: "Point", coordinates: [81.5212, 16.5449] },
// //   },
// //   {
// //     _id: depotIds.machilipatnam,
// //     name: "Machilipatnam Depot",
// //     city: "Machilipatnam",
// //     location: { type: "Point", coordinates: [81.1389, 16.1875] },
// //   },
// //   {
// //     _id: depotIds.gudivada,
// //     name: "Gudivada Depot",
// //     city: "Gudivada",
// //     location: { type: "Point", coordinates: [80.9928, 16.441] },
// //   },
// //   {
// //     _id: depotIds.amalapuram,
// //     name: "Amalapuram Depot",
// //     city: "Amalapuram",
// //     location: { type: "Point", coordinates: [82.0061, 16.579] },
// //   },
// //   {
// //     _id: depotIds.narasapuram,
// //     name: "Narasapuram Depot",
// //     city: "Narasapuram",
// //     location: { type: "Point", coordinates: [81.6995, 16.433] },
// //   },
// //   {
// //     _id: depotIds.proddatur,
// //     name: "Proddatur Depot",
// //     city: "Proddatur",
// //     location: { type: "Point", coordinates: [78.5631, 14.7502] },
// //   },
// //   {
// //     _id: depotIds.madanapalle,
// //     name: "Madanapalle Depot",
// //     city: "Madanapalle",
// //     location: { type: "Point", coordinates: [78.501, 13.5503] },
// //   },
// //   {
// //     _id: depotIds.hindupur,
// //     name: "Hindupur Depot",
// //     city: "Hindupur",
// //     location: { type: "Point", coordinates: [77.4914, 13.8289] },
// //   },
// //   {
// //     _id: depotIds.nandyal,
// //     name: "Nandyal Depot",
// //     city: "Nandyal",
// //     location: { type: "Point", coordinates: [78.4829, 15.4786] },
// //   },
// //   {
// //     _id: depotIds.parvathipuram,
// //     name: "Parvathipuram Depot",
// //     city: "Parvathipuram",
// //     location: { type: "Point", coordinates: [83.4281, 18.783] },
// //   },

// //   // --- Telangana Depots ---
// //   {
// //     _id: depotIds.hyderabadMgbs,
// //     name: "Hyderabad MGBS Depot",
// //     city: "Hyderabad",
// //     location: { type: "Point", coordinates: [78.4867, 17.385] },
// //   },
// //   {
// //     _id: depotIds.secunderabadJbs,
// //     name: "Secunderabad Jubilee Bus Station Depot",
// //     city: "Secunderabad",
// //     location: { type: "Point", coordinates: [78.5245, 17.4399] },
// //   },
// //   {
// //     _id: depotIds.warangal,
// //     name: "Warangal Depot",
// //     city: "Warangal",
// //     location: { type: "Point", coordinates: [79.5941, 17.9784] },
// //   },
// //   {
// //     _id: depotIds.hanamkonda,
// //     name: "Hanamkonda Depot",
// //     city: "Hanamkonda",
// //     location: { type: "Point", coordinates: [79.5583, 17.9939] },
// //   },
// //   {
// //     _id: depotIds.khammam,
// //     name: "Khammam Depot",
// //     city: "Khammam",
// //     location: { type: "Point", coordinates: [80.1406, 17.2473] },
// //   },
// //   {
// //     _id: depotIds.karimnagar,
// //     name: "Karimnagar Depot",
// //     city: "Karimnagar",
// //     location: { type: "Point", coordinates: [79.1288, 18.4386] },
// //   },
// //   {
// //     _id: depotIds.nizamabad,
// //     name: "Nizamabad Depot",
// //     city: "Nizamabad",
// //     location: { type: "Point", coordinates: [78.0941, 18.6725] },
// //   },
// //   {
// //     _id: depotIds.adilabad,
// //     name: "Adilabad Depot",
// //     city: "Adilabad",
// //     location: { type: "Point", coordinates: [78.5359, 19.6641] },
// //   },
// //   {
// //     _id: depotIds.mancherial,
// //     name: "Mancherial Depot",
// //     city: "Mancherial",
// //     location: { type: "Point", coordinates: [79.4635, 18.8707] },
// //   },
// //   {
// //     _id: depotIds.mahbubnagar,
// //     name: "Mahbubnagar Depot",
// //     city: "Mahbubnagar",
// //     location: { type: "Point", coordinates: [77.985, 16.748] },
// //   },
// //   {
// //     _id: depotIds.nalgonda,
// //     name: "Nalgonda Depot",
// //     city: "Nalgonda",
// //     location: { type: "Point", coordinates: [79.2674, 17.0575] },
// //   },
// //   {
// //     _id: depotIds.suryapet,
// //     name: "Suryapet Depot",
// //     city: "Suryapet",
// //     location: { type: "Point", coordinates: [79.6205, 17.1405] },
// //   },
// //   {
// //     _id: depotIds.kodad,
// //     name: "Kodad Depot",
// //     city: "Kodad",
// //     location: { type: "Point", coordinates: [79.9656, 16.9985] },
// //   },
// //   {
// //     _id: depotIds.siddipet,
// //     name: "Siddipet Depot",
// //     city: "Siddipet",
// //     location: { type: "Point", coordinates: [78.8521, 18.1048] },
// //   },
// //   {
// //     _id: depotIds.medak,
// //     name: "Medak Depot",
// //     city: "Medak",
// //     location: { type: "Point", coordinates: [78.26, 18.045] },
// //   },
// //   {
// //     _id: depotIds.zaheerabad,
// //     name: "Zaheerabad Depot",
// //     city: "Zaheerabad",
// //     location: { type: "Point", coordinates: [77.55, 17.6833] },
// //   },
// //   {
// //     _id: depotIds.bhongir,
// //     name: "Bhongir Depot",
// //     city: "Bhongir",
// //     location: { type: "Point", coordinates: [78.883, 17.515] },
// //   },
// //   {
// //     _id: depotIds.jangaon,
// //     name: "Jangaon Depot",
// //     city: "Jangaon",
// //     location: { type: "Point", coordinates: [79.1516, 17.726] },
// //   },
// //   {
// //     _id: depotIds.miryalaguda,
// //     name: "Miryalaguda Depot",
// //     city: "Miryalaguda",
// //     location: { type: "Point", coordinates: [79.5655, 16.873] },
// //   },
// //   {
// //     _id: depotIds.kamareddy,
// //     name: "Kamareddy Depot",
// //     city: "Kamareddy",
// //     location: { type: "Point", coordinates: [78.344, 18.3166] },
// //   },
// //   {
// //     _id: depotIds.bhadrachalam,
// //     name: "Bhadrachalam Depot",
// //     city: "Bhadrachalam",
// //     location: { type: "Point", coordinates: [80.8893, 17.6686] },
// //   },
// //   {
// //     _id: depotIds.palvoncha,
// //     name: "Palvoncha Depot",
// //     city: "Palvoncha",
// //     location: { type: "Point", coordinates: [80.684, 17.601] },
// //   },
// //   {
// //     _id: depotIds.kothagudem,
// //     name: "Kothagudem Depot",
// //     city: "Kothagudem",
// //     location: { type: "Point", coordinates: [80.639, 17.5511] },
// //   },
// //   {
// //     _id: depotIds.manuguru,
// //     name: "Manuguru Depot",
// //     city: "Manuguru",
// //     location: { type: "Point", coordinates: [80.826, 17.8974] },
// //   },
// //   {
// //     _id: depotIds.siricilla,
// //     name: "Siricilla Depot",
// //     city: "Siricilla",
// //     location: { type: "Point", coordinates: [78.8092, 18.3886] },
// //   },
// // ];

// export const routes = [
//   // Route 1: Major Trunk Route
//   {
//     _id: new mongoose.Types.ObjectId(),
//     routeName: "Vijayawada to Hyderabad Super Luxury",
//     origin: "Vijayawada",
//     destination: "Hyderabad",
//     distance_km: 275,
//     stops: [
//       {
//         name: "Vijayawada (PNBS)",
//         latitude: 16.5062,
//         longitude: 80.648,
//         arrival_offset_mins: 0,
//         departure_offset_mins: 10,
//       },
//       {
//         name: "Suryapet",
//         latitude: 17.1405,
//         longitude: 79.6205,
//         arrival_offset_mins: 150,
//         departure_offset_mins: 160,
//       },
//       {
//         name: "Hyderabad (MGBS)",
//         latitude: 17.385,
//         longitude: 78.4867,
//         arrival_offset_mins: 300,
//         departure_offset_mins: 300,
//       },
//     ],
//   },

//   // Route 2: Major Coastal Route
//   {
//     _id: new mongoose.Types.ObjectId(),
//     routeName: "Vijayawada to Visakhapatnam Express",
//     origin: "Vijayawada",
//     destination: "Visakhapatnam",
//     distance_km: 350,
//     stops: [
//       {
//         name: "Vijayawada (PNBS)",
//         latitude: 16.5062,
//         longitude: 80.648,
//         arrival_offset_mins: 0,
//         departure_offset_mins: 10,
//       },
//       {
//         name: "Rajahmundry",
//         latitude: 17.0005,
//         longitude: 81.804,
//         arrival_offset_mins: 180,
//         departure_offset_mins: 195,
//       },
//       {
//         name: "Visakhapatnam",
//         latitude: 17.6868,
//         longitude: 83.2185,
//         arrival_offset_mins: 390,
//         departure_offset_mins: 390,
//       },
//     ],
//   },

//   // Route 3: Long-Distance Pilgrimage Route
//   {
//     _id: new mongoose.Types.ObjectId(),
//     routeName: "Vijayawada to Tirupati Ultra Deluxe",
//     origin: "Vijayawada",
//     destination: "Tirupati",
//     distance_km: 435,
//     stops: [
//       {
//         name: "Vijayawada (PNBS)",
//         latitude: 16.5062,
//         longitude: 80.648,
//         arrival_offset_mins: 0,
//         departure_offset_mins: 10,
//       },
//       {
//         name: "Ongole",
//         latitude: 15.5057,
//         longitude: 80.0499,
//         arrival_offset_mins: 150,
//         departure_offset_mins: 165,
//       },
//       {
//         name: "Nellore",
//         latitude: 14.4426,
//         longitude: 79.9865,
//         arrival_offset_mins: 285,
//         departure_offset_mins: 295,
//       },
//       {
//         name: "Tirupati",
//         latitude: 13.6288,
//         longitude: 79.4192,
//         arrival_offset_mins: 450,
//         departure_offset_mins: 450,
//       },
//     ],
//   },

//   // Route 4: Short, High-Frequency Local Route
//   {
//     _id: new mongoose.Types.ObjectId(),
//     routeName: "Vijayawada to Guntur Palle Velugu",
//     origin: "Vijayawada",
//     destination: "Guntur",
//     distance_km: 35,
//     stops: [
//       {
//         name: "Vijayawada (PNBS)",
//         latitude: 16.5062,
//         longitude: 80.648,
//         arrival_offset_mins: 0,
//         departure_offset_mins: 5,
//       },
//       {
//         name: "Guntur",
//         latitude: 16.3067,
//         longitude: 80.4365,
//         arrival_offset_mins: 65,
//         departure_offset_mins: 65,
//       },
//     ],
//   },

//   // Route 5: Regional Route
//   {
//     _id: new mongoose.Types.ObjectId(),
//     routeName: "Vijayawada to Bhimavaram Express",
//     origin: "Vijayawada",
//     destination: "Bhimavaram",
//     distance_km: 115,
//     stops: [
//       {
//         name: "Vijayawada (PNBS)",
//         latitude: 16.5062,
//         longitude: 80.648,
//         arrival_offset_mins: 0,
//         departure_offset_mins: 10,
//       },
//       {
//         name: "Gudivada",
//         latitude: 16.441,
//         longitude: 80.9928,
//         arrival_offset_mins: 80,
//         departure_offset_mins: 85,
//       },
//       {
//         name: "Bhimavaram",
//         latitude: 16.5449,
//         longitude: 81.5212,
//         arrival_offset_mins: 150,
//         departure_offset_mins: 150,
//       },
//     ],
//   },
// ];
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// --- 1. SETUP & DATABASE CONNECTION ---
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://karyampudimadhav_db_user:aYnPoEO5JoXvdjB6@busnext.g5d5ecd.mongodb.net/BUSNEXT?retryWrites=true&w=majority&appName=BusNext"
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to DB: ${error.message}`);
    process.exit(1);
  }
};

// --- 2. IMPORT YOUR STAFF MODEL ---
// Make sure the path to your model file is correct

// --- 3. SEEDER SCRIPT LOGIC ---
const seedStaff = async () => {
  await connectDB();

  try {
    // Clear previous staff to avoid duplicate employee_id erro
    // --- Insert the data into the database ---
    await Vehicle.insertMany(vehicles);
    await Trip.insertMany(trips);
    console.log(`${vehicles.length} new vehicles created.`);
    console.log(`${trips.length} new trips created.`);

    console.log("--- Seeding Complete ---");
    console.log("Example Login -> employee_id: 'D-1001', password: 'D1001'");
    process.exit();
  } catch (error) {
    console.error(`Seeder Error: ${error}`);
    process.exit(1);
  }
};

// Run the seeder function
seedStaff();

import mongoose from "mongoose";

export const vehicles = [
  {
    _id: new mongoose.Types.ObjectId(),
    bus_number: "AP16ZZ1A1A",
    service_type: "Super Luxury",
    total_seats: 44,
    amenities: ["AC", "WiFi"],
    depot_id: depotIds.vijayawada,
    status: "AVAILABLE",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    bus_number: "AP27ZZ2B2B",
    service_type: "Express",
    total_seats: 55,
    amenities: ["Charging Ports"],
    depot_id: depotIds.guntur,
    status: "AVAILABLE",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    bus_number: "TS09ZZ3C3C",
    service_type: "Garuda Volvo",
    total_seats: 45,
    amenities: ["AC", "TV", "Water Bottle"],
    depot_id: depotIds.hyderabadMgbs,
    status: "AVAILABLE",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    bus_number: "AP03ZZ4D4D",
    service_type: "Ultra Deluxe",
    total_seats: 48,
    amenities: ["AC"],
    depot_id: depotIds.tirupati,
    status: "AVAILABLE",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    bus_number: "AP37ZZ5E5E",
    service_type: "Palle Velugu",
    total_seats: 60,
    amenities: [],
    depot_id: depotIds.bhimavaram,
    status: "AVAILABLE",
  },
];

// ---------------- 5 New Trips, Scheduled for 3 Days from Now ----------------
export const trips = [
  {
    _id: new mongoose.Types.ObjectId(),
    route_id: getRandom(routes)._id,
    vehicle_id: vehicles_chunk5[0]._id, // Using the new vehicles from this file
    driver_id: getRandom(drivers)._id,
    departure_datetime: new Date("2025-09-29T07:00:00Z"), // Scheduled 3 days from now
    status: "SCHEDULED",
    seat_allocation: { online: 34, offline: 10 },
    tickets_booked: { online: 0, offline: 0 }, // No tickets booked
  },
  {
    _id: new mongoose.Types.ObjectId(),
    route_id: getRandom(routes)._id,
    vehicle_id: vehicles_chunk5[1]._id,
    driver_id: getRandom(drivers)._id,
    departure_datetime: new Date("2025-09-29T09:30:00Z"), // Scheduled 3 days from now
    status: "SCHEDULED",
    seat_allocation: { online: 45, offline: 10 },
    tickets_booked: { online: 0, offline: 0 }, // No tickets booked
  },
  {
    _id: new mongoose.Types.ObjectId(),
    route_id: getRandom(routes)._id,
    vehicle_id: vehicles_chunk5[2]._id,
    driver_id: getRandom(drivers)._id,
    departure_datetime: new Date("2025-09-29T11:00:00Z"), // Scheduled 3 days from now
    status: "SCHEDULED",
    seat_allocation: { online: 35, offline: 10 },
    tickets_booked: { online: 0, offline: 0 }, // No tickets booked
  },
  {
    _id: new mongoose.Types.ObjectId(),
    route_id: getRandom(routes)._id,
    vehicle_id: vehicles_chunk5[3]._id,
    driver_id: getRandom(drivers)._id,
    departure_datetime: new Date("2025-09-29T21:00:00Z"), // Scheduled 3 days from now
    status: "SCHEDULED",
    seat_allocation: { online: 38, offline: 10 },
    tickets_booked: { online: 0, offline: 0 }, // No tickets booked
  },
  {
    _id: new mongoose.Types.ObjectId(),
    route_id: getRandom(routes)._id,
    vehicle_id: vehicles_chunk5[4]._id,
    driver_id: getRandom(drivers)._id,
    departure_datetime: new Date("2025-09-29T22:30:00Z"), // Scheduled 3 days from now
    status: "SCHEDULED",
    seat_allocation: { online: 50, offline: 10 },
    tickets_booked: { online: 0, offline: 0 }, // No tickets booked
  },
];
