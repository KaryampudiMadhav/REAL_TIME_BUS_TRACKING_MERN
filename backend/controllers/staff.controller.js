// Staff login for ADMIN
import bcryptjs from "bcryptjs";

import Staff from "../models/staff.model.js";
import { generateStaffTokenAndSetCookiesAndStaff } from "../utils/generateStaffTokenAndSetCookiesForStaff.js";

export const staffAdminLogin = async (req, res) => {
  const { employee_id, password } = req.body;
  if (!employee_id || !password) {
    return res.status(400).json({
      success: false,
      error: "Employee ID and password are required.",
    });
  }
  try {
    const staff = await Staff.findOne({ employee_id }).select(
      "+password is_active role"
    );
    console.log("Staff not found:", staff);
    if (!staff) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    if (staff.role !== "ADMIN") {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    if (!staff.is_active) {
      return res
        .status(403)
        .json({ success: false, error: "Staff account is inactive." });
    }
    const isMatch = await bcryptjs.compare(password, staff.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    console.log("Generating token for staff:", staff._id, staff.role);
    const token = await generateStaffTokenAndSetCookiesAndStaff(
      res,
      staff._id,
      staff.role
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      staff: { ...staff._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Staff login for MUNICIPAL
export const staffMunicipalLogin = async (req, res) => {
  const { employee_id, password } = req.body;
  if (!employee_id || !password) {
    return res.status(400).json({
      success: false,
      error: "Employee ID and password are required.",
    });
  }
  try {
    const staff = await Staff.findOne({
      employee_id,
      role: "MUNICIPAL",
    }).select("+password is_active");
    if (!staff) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    if (!staff.is_active) {
      return res
        .status(403)
        .json({ success: false, error: "Staff account is inactive." });
    }
    const isMatch = await bcryptjs.compare(password, staff.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    const token = await generateStaffTokenAndSetCookiesAndStaff(
      res,
      staff._id,
      staff.role
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      staff: { ...staff._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Staff login for CONDUCTOR/DRIVER
export const staffWorkerLogin = async (req, res) => {
  const { employee_id, password, role } = req.body;
  if (!employee_id || !password || !role) {
    return res.status(400).json({
      success: false,
      error: "Employee ID, password, and role are required.",
    });
  }
  if (role !== "CONDUCTOR" && role !== "DRIVER") {
    return res
      .status(400)
      .json({ success: false, error: "Role must be CONDUCTOR or DRIVER." });
  }
  try {
    const staff = await Staff.findOne({ employee_id, role }).select(
      "+password is_active role"
    );
    if (!staff) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    if (!staff.is_active) {
      return res
        .status(403)
        .json({ success: false, error: "Staff account is inactive." });
    }
    const isMatch = await bcryptjs.compare(password, staff.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    const token = await generateStaffTokenAndSetCookiesAndStaff(
      res,
      staff._id,
      staff.role
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      staff: { ...staff._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const staffLogout = async (req, res) => {
  res.clearCookie("staffjwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.clearCookie("jwt"); // Clear user token if present too, just to be safe
  res
    .status(200)
    .json({ success: true, message: "Staff logged out successfully." });
};

export const staffLogin = async (req, res) => {
  const { employee_id, password } = req.body;
  if (!employee_id || !password) {
    return res.status(400).json({
      success: false,
      error: "Employee ID and password are required.",
    });
  }
  try {
    const staff = await Staff.findOne({ employee_id }).select(
      "+password role is_active"
    );
    if (!staff || staff.role !== "ADMIN") {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    if (!staff.is_active) {
      return res
        .status(403)
        .json({ success: false, error: "Staff account is inactive." });
    }
    const isMatch = await bcryptjs.compare(password, staff.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    const token = await generateStaffTokenAndSetCookiesAndStaff(
      res,
      staff._id,
      staff.role
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      staff: { ...staff._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createStaff = async (req, res) => {
  // Only admin can add staff
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admin can add staff." });
  }
  const {
    employee_id,
    depot_id,
    date_of_joining,
    work_contact_number,
    address,
    license_details,
    is_active,
  } = req.body;
  try {
    // Check for duplicate employee_id
    const staffExists = await Staff.findOne({ employee_id });
    if (staffExists) {
      return res.status(400).json({ message: "Employee ID already exists." });
    }
    const newStaff = await Staff.create({
      employee_id,
      depot_id,
      date_of_joining,
      work_contact_number,
      address,
      license_details,
      is_active,
    });
    res.status(201).json(newStaff);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating staff member", error: error.message });
  }
};

export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find({}).populate("user_id");
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { depot_id, license_details } = req.body;
    const staffMember = await Staff.findById(req.params.id);

    if (staffMember) {
      staffMember.depot_id = depot_id || staffMember.depot_id;
      staffMember.license_details =
        license_details || staffMember.license_details;

      const updatedStaff = await staffMember.save();
      res.status(200).json(updatedStaff);
    } else {
      res.status(404).json({ message: "Staff member not found" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating staff member", error: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const staffMember = await Staff.findById(req.params.id);

    if (staffMember) {
      await staffMember.deleteOne();
      // You might also want to delete their User account or change its role
      res.status(200).json({ message: "Staff member removed successfully" });
    } else {
      res.status(404).json({ message: "Staff member not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Staff login for CONDUCTOR/DRIVER

// Check Auth
export const getCurrentStaff = async (req, res) => {
  try {
    const staff = req.staff;
    const staffObj = staff.toObject ? staff.toObject() : staff;
    res.status(200).json({
      success: true,
      staff: { ...staffObj, password: undefined }
    });
  } catch (error) {
    console.error("Error in getCurrentStaff:", error);
    res.status(500).json({ message: "Error fetching staff profile" });
  }
};
