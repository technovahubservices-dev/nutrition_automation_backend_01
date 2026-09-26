const express = require("express");
const mongoose = require("mongoose");

const ReminderLog = require("../models/ReminderLog");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Get reminder history for a customer
router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }

    const reminders = await ReminderLog.find({
      customerId
    })
      .populate("scheduleId")
      .sort({ triggeredAt: -1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get reminders",
      error: error.message
    });
  }
});

// Get one reminder
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid reminder ID"
      });
    }

    const reminder = await ReminderLog.findById(id)
      .populate("scheduleId")
      .populate("customerId");

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found"
      });
    }

    res.json(reminder);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get reminder",
      error: error.message
    });
  }
});

// Update reminder status
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid reminder ID"
      });
    }

    if (!["pending", "sent", "failed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid reminder status"
      });
    }

    const reminder = await ReminderLog.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found"
      });
    }

    res.json({
      message: "Reminder status updated successfully",
      reminder
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update reminder",
      error: error.message
    });
  }
});

module.exports = router;


