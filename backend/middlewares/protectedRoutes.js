// Middleware for staff conductor/driver check
import jwt from "jsonwebtoken";
import Staff from "../models/staff.model.js";

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
      return res
        .status(403)
        .json({ message: "Not authorized as conductor or driver" });
    }
    const staff = await Staff.findById(decoded.staffId);
    if (staff && (staff.role === "CONDUCTOR" || staff.role === "DRIVER")) {
      req.staffId = decoded.staffId;
      req.role = decoded.role;
      next();
    } else {
      res
        .status(403)
        .json({ message: "Not authorized as conductor or driver" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while checking conductor/driver role" });
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

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
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
      console.log("User JWT:", req.userId);
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
