import Staff from "../models/staff.model.js";
import User from "../models/user.model.js";

export const createStaff = async (req, res) => {
  const { user_id, employee_id, depot_id, license_details } = req.body;

  try {
    // 1. Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User to be linked not found." });
    }
    // 2. Check if the user has a valid role
    if (user.role !== "DRIVER" && user.role !== "CONDUCTOR") {
      return res
        .status(400)
        .json({ message: "User must have a DRIVER or CONDUCTOR role." });
    }
    // 3. Check if this user is already linked to another staff profile
    const staffExists = await Staff.findOne({ user_id });
    if (staffExists) {
      return res
        .status(400)
        .json({ message: "This user is already linked to a staff profile." });
    }

    const newStaff = await Staff.create({
      user_id,
      employee_id,
      depot_id,
      license_details: user.role === "DRIVER" ? license_details : undefined,
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
    // Populate user details to show name, email, and role
    const staff = await Staff.find({}).populate(
      "user_id",
      "fullName email role"
    );
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
