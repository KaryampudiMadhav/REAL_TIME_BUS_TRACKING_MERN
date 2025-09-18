import Route from "../models/route.model.js";

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
