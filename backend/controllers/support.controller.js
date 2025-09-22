import SupportTicket from "./../models/support.model.js";
export const createTicket = async (req, res) => {
  const { trip_id, category, subject, description } = req.body;
  try {
    const ticket = await SupportTicket.create({
      user_id: req.user.id, // from 'protect' middleware
      trip_id,
      category,
      subject,
      description,
    });
    res.status(201).json(ticket);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating ticket", error: error.message });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user_id: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const tickets = await SupportTicket.find({ ...filter })
      .populate("user_id", "fullName email")
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (ticket) {
      ticket.status = status;
      await ticket.save();
      res.status(200).json(ticket);
    } else {
      res.status(404).json({ message: "Support ticket not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating ticket status" });
  }
};

export const addAdminNote = async (req, res) => {
  try {
    const { note } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (ticket) {
      const adminNote = {
        admin_id: req.user.id,
        note: note,
      };
      ticket.admin_notes.push(adminNote);
      await ticket.save();
      res.status(201).json(ticket);
    } else {
      res.status(404).json({ message: "Support ticket not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error adding admin note" });
  }
};
