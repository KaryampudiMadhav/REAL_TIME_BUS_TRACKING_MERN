// Middleware for staff conductor/driver check
import jwt from "jsonwebtoken";
import Staff from "../models/staff.model.js";
import User from "../models/user.model.js";

export const staffConductorDriver = async (req, res, next) => {
  try {
    const token = req.cookies.staffjwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (
      !decoded.staffId ||
      !(decoded.role === "CONDUCTOR" || decoded.role === "DRIVER")
    ) {
      console.log("Middleware 403: Invalid role or staffId", decoded);
      return res
        .status(403)
        .json({
          message: `Not authorized: Token Role is ${decoded.role}. Expected CONDUCTOR or DRIVER.`,
          code: "ROLE_MISMATCH"
        });
    }
    const staff = await Staff.findById(decoded.staffId);
    if (staff && (staff.role === "CONDUCTOR" || staff.role === "DRIVER")) {
      req.staffId = decoded.staffId;
      req.role = decoded.role;
      next();
    } else {
      console.log("Middleware 403: Staff not found or role mismatch in DB", staff);
      res
        .status(403)
        .json({ message: `Not authorized: DB Role is ${staff ? staff.role : 'Staff Not Found'}` });
    }
  } catch (error) {
    console.error("Middleware Error:", error);
    res
      .status(500)
      .json({ message: "Server error while checking conductor/driver role" });
  }
};

export const protectStaff = async (req, res, next) => {
  try {
    const token = req.cookies.staffjwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - no token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.staffId) {
      return res.status(403).json({ message: "Invalid token payload" });
    }
    const staff = await Staff.findById(decoded.staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    req.staffId = decoded.staffId;
    req.role = decoded.role;
    req.staff = staff;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Staff auth error" });
  }
};

export const staffAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.staffjwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("adminmiddle decoded JWT:", decoded);
    if (!decoded.staffId || decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized as staff admin" });
    }

    const staff = await Staff.findById(decoded.staffId);
    if (staff && staff.role === "ADMIN") {
      req.staffId = decoded.staffId;
      req.role = decoded.role;
      next();
    } else {
      res.status(403).json({ message: "Not authorized as staff admin" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while checking staff admin role" });
  }
};

// Middleware for staff municipal check
export const staffMunicipal = async (req, res, next) => {
  try {
    const token = req.cookies.staffjwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.staffId || decoded.role !== "MUNICIPAL") {
      return res
        .status(403)
        .json({ message: "Not authorized as staff municipal" });
    }
    const staff = await Staff.findById(decoded.staffId);
    if (staff && staff.role === "MUNICIPAL") {
      next();
    } else {
      res.status(403).json({ message: "Not authorized as staff municipal" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while checking staff municipal role" });
  }
};

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.jwt;
  console.log("verifyToken Middleware - Cookies:", req.cookies);
  console.log("verifyToken Middleware - Headers:", req.headers);
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });
    }

    // Attach userId for user JWTs
    if (decoded.userId) {
      req.userId = decoded.userId;
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      req.user = user;
    }
    next();
  } catch (error) {
    console.log("Error in verifyToken middleware: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};