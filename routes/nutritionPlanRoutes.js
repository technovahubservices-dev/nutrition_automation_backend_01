const express = require("express");
const mongoose = require("mongoose");
const NutritionPlan = require("../models/NutritionPlan");
const authMiddleware = require("../middleware/authMiddleware");
const Customer = require("../models/Customer");

const router = express.Router();

router.use(authMiddleware);

// Create nutrition plan
router.post("/", async (req, res) => {
  try {
    const {
      customerId,
      fileName,
      fileType,
      fileUrl
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    if (!fileName || !fileType) {
      return res.status(400).json({
        message: "fileName and fileType are required"
      });
    }

    if (!["excel", "pdf"].includes(fileType)) {
      return res.status(400).json({
        message: "fileType must be excel or pdf"
      });
    }

    const plan = await NutritionPlan.create({
      customerId,
      fileName,
      fileType,
      fileUrl
    });

    res.status(201).json({
      message: "Nutrition plan created successfully",
      plan
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create nutrition plan",
      error: error.message
    });
  }
});

// Get all nutrition plans
router.get("/", async (req, res) => {
  try {
    const plans = await NutritionPlan.find()
      .populate("customerId", "name phone whatsappNumber")
      .sort({ createdAt: -1 });

    res.json(plans);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get nutrition plans",
      error: error.message
    });
  }
});
// Get plans for a customer
router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }

    const plans = await NutritionPlan.find({
      customerId
    }).sort({ createdAt: -1 });

    res.json(plans);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get nutrition plans",
      error: error.message
    });
  }
});

module.exports = router;



