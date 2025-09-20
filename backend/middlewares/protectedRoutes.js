import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // We need User model for the admin check

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

    // Attach the user's ID to the request object
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// This is the updated admin middleware that works with your verifyToken
export const admin = async (req, res, next) => {
  try {
    // 1. Get the user from the database using the ID from verifyToken
    const user = await User.findById(req.userId);

    // 2. Check if the user exists and has the 'ADMIN' role
    if (user && user.role === "ADMIN") {
      next();
    } else {
      res.status(403).json({ message: "Not authorized as an admin" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error while checking admin role" });
  }
};

export const conductor = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user && user.role === "CONDUCTOR") {
      next();
    } else {
      res.status(403).json({ message: "Not authorized as a conductor" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while checking conductor role" });
  }
};

export const municipal = (req, res, next) => {
  if (req.user && req.user.role === "MUNICIPAL") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as a municipal user" });
  }
};
