const express = require("express");
const mongoose = require("mongoose");

const Schedule = require("../models/Schedule");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Get all schedules for a customer
router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }

    const schedules = await Schedule.find({
      customerId
    }).sort({ time: 1 });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get schedules",
      error: error.message
    });
  }
});

// Get one schedule
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid schedule ID"
      });
    }

    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found"
      });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get schedule",
      error: error.message
    });
  }
});

// Update schedule
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid schedule ID"
      });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found"
      });
    }

    res.json({
      message: "Schedule updated successfully",
      schedule
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update schedule",
      error: error.message
    });
  }
});

// Delete schedule
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid schedule ID"
      });
    }

    const schedule = await Schedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found"
      });
    }

    res.json({
      message: "Schedule deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete schedule",
      error: error.message
    });
  }
});

module.exports = router;


