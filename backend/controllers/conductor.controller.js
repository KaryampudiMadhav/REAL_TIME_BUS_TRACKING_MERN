import Staff from "../models/staff.model.js";
import IssueReport from "../models/issueReport.model.js";

export const createIssueReport = async (req, res) => {
  const { trip_id, issue_type, message } = req.body;
  try {
    // Find the staff profile for the logged-in user
    const staffProfile = await Staff.findOne({ user_id: req.user._id });
    if (!staffProfile) {
      return res.status(404).json({ message: "Staff profile not found." });
    }

    const report = await IssueReport.create({
      trip_id,
      reported_by_staff_id: staffProfile._id,
      issue_type,
      message,
    });
    res.status(201).json(report);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating issue report.", error: error.message });
  }
};
