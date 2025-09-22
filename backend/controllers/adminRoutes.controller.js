import Route from "../models/route.model.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

export const createRoute = async (req, res) => {
  const { routeName, origin, destination, stops, distance_km } = req.body;

  try {
    const routeExists = await Route.findOne({ routeName });
    if (routeExists) {
      return res
        .status(400)
        .json({ message: "A route with this name already exists" });
    }

    const route = await Route.create({
      routeName,
      origin,
      destination,
      stops,
      distance_km,
    });

    res.status(201).json(route);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating route", error: error.message });
  }
};

export const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find({});
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (route) {
      res.status(200).json(route);
    } else {
      res.status(404).json({ message: "Route not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateRoute = async (req, res) => {
  try {
    const { routeName, origin, destination, stops, distance_km } = req.body;
    const route = await Route.findById(req.params.id);

    if (route) {
      route.routeName = routeName || route.routeName;
      route.origin = origin || route.origin;
      route.destination = destination || route.destination;
      route.stops = stops || route.stops;
      route.distance_km = distance_km || route.distance_km;

      const updatedRoute = await route.save();
      res.status(200).json(updatedRoute);
    } else {
      res.status(404).json({ message: "Route not found" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating route", error: error.message });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (route) {
      await route.deleteOne();
      res.status(200).json({ message: "Route removed successfully" });
    } else {
      res.status(404).json({ message: "Route not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createUserByAdmin = async (req, res) => {
  const { fullName, email, password, contact_number, role } = req.body;

  if (!fullName || !email || !password || !contact_number || !role) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists." });
    }

    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Admin can specify the role. The new user is auto-verified.
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      contact_number,
      role,
      isVerified: true,
    });

    newUser.password = undefined;
    res.status(201).json({
      success: true,
      message: `New ${role.toLowerCase()} user created successfully.`,
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};
