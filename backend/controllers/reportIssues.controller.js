// Get issues reported by the current user (staff)
export const getMyIssueReports = async (req, res) => {
  try {
    // Find staff profile for current user
    const staffProfile =
      await require("../models/staff.model.js").default.findOne({
        user_id: req.user._id,
      });
    if (!staffProfile) {
      return res.status(404).json({ message: "Staff profile not found." });
    }
    const reports = await IssueReport.find({
      reported_by_staff_id: staffProfile._id,
    })
      .populate({
        path: "trip_id",
        select: "departure_datetime",
        populate: { path: "route_id", select: "routeName" },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
import IssueReport from "../models/issueReport.model.js";

export const getAllIssueReports = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const reports = await IssueReport.find({ ...filter })
      .populate({
        path: "trip_id",
        select: "departure_datetime",
        populate: { path: "route_id", select: "routeName" },
      })
      .populate({
        path: "reported_by_staff_id",
        select: "employee_id",
        populate: { path: "user_id", select: "fullName" },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await IssueReport.findById(req.params.id);

    if (report) {
      report.status = status;
      await report.save();
      res.status(200).json(report);
    } else {
      res.status(404).json({ message: "Issue report not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating issue status" });
  }
};
