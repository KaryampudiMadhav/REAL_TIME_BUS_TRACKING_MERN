// data/staff.data.js
import mongoose from "mongoose";
// Import the "key ring" of depot ObjectIDs to link staff to their home depot
import { depotIds } from "./depos.data.js";

export const staff = [
  // --- Drivers ---
  {
    _id: new mongoose.Types.ObjectId(),
    user_id: new mongoose.Types.ObjectId(), // Placeholder for the actual User ID
    employee_id: "D-1001",
    depot_id: depotIds.vijayawada,
    date_of_joining: new Date("2020-05-15T00:00:00Z"),
    is_active: true,
    work_contact_number: "9876543210",
    address: { city: "Vijayawada", state: "Andhra Pradesh", pincode: "520001" },
    license_details: {
      number: "AP1620200012345",
      expiry_date: new Date("2030-05-14T00:00:00Z"),
    },
  },
  {
    _id: new mongoose.Types.ObjectId(),
    user_id: new mongoose.Types.ObjectId(),
    employee_id: "D-1002",
    depot_id: depotIds.bhimavaram,
    date_of_joining: new Date("2018-11-20T00:00:00Z"),
    is_active: true,
    work_contact_number: "9876543211",
    address: { city: "Bhimavaram", state: "Andhra Pradesh", pincode: "534201" },
    license_details: {
      number: "AP3720180054321",
      expiry_date: new Date("2028-11-19T00:00:00Z"),
    },
  },
  {
    _id: new mongoose.Types.ObjectId(),
    user_id: new mongoose.Types.ObjectId(),
    employee_id: "D-1003",
    depot_id: depotIds.hyderabadMgbs,
    date_of_joining: new Date("2021-02-10T00:00:00Z"),
    is_active: true,
    work_contact_number: "9876543212",
    address: { city: "Hyderabad", state: "Telangana", pincode: "500012" },
    license_details: {
      number: "TS0920210098765",
      expiry_date: new Date("2031-02-09T00:00:00Z"),
    },
  },
  {
    _id: new mongoose.Types.ObjectId(),
    user_id: new mongoose.Types.ObjectId(),
    employee_id: "D-1004",
    depot_id: depotIds.visakhapatnam,
    date_of_joining: new Date("2019-08-01T00:00:00Z"),
    is_active: false, // Example of an inactive employee
    work_contact_number: "9876543213",
    address: {
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      pincode: "530001",
    },
    license_details: {
      number: "AP3120190011223",
      expiry_date: new Date("2029-07-31T00:00:00Z"),
    },
  },

  // --- Conductors ---
  {
    _id: new mongoose.Types.ObjectId(),
    user_id: new mongoose.Types.ObjectId(),
    employee_id: "C-2001",
    depot_id: depotIds.vijayawada,
    date_of_joining: new Date("2021-07-22T00:00:00Z"),
    is_active: true,
    work_contact_number: "9765432101",
    address: { city: "Vijayawada", state: "Andhra Pradesh", pincode: "520008" },
    // No license_details for conductors
  },
  {
    _id: new mongoose.Types.ObjectId(),
    user_id: new mongoose.Types.ObjectId(),
    employee_id: "C-2002",
    depot_id: depotIds.bhimavaram,
    date_of_joining: new Date("2022-01-05T00:00:00Z"),
    is_active: true,
    work_contact_number: "9765432102",
    address: { city: "Bhimavaram", state: "Andhra Pradesh", pincode: "534202" },
  },
  {
    _id: new mongoose.Types.ObjectId(),
    user_id: new mongoose.Types.ObjectId(),
    employee_id: "C-2003",
    depot_id: depotIds.hyderabadMgbs,
    date_of_joining: new Date("2019-03-12T00:00:00Z"),
    is_active: true,
    work_contact_number: "9765432103",
    address: { city: "Hyderabad", state: "Telangana", pincode: "500024" },
  },
  {
    _id: new mongoose.Types.ObjectId(),
    user_id: new mongoose.Types.ObjectId(),
    employee_id: "C-2004",
    depot_id: depotIds.tirupati,
    date_of_joining: new Date("2020-09-30T00:00:00Z"),
    is_active: true,
    work_contact_number: "9765432104",
    address: { city: "Tirupati", state: "Andhra Pradesh", pincode: "517501" },
  },
];
