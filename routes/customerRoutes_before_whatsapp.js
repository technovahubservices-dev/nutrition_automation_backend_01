const express = require("express");
const mongoose = require("mongoose");

const Customer = require("../models/Customer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Create customer
router.post("/", async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json({
      message: "Customer created successfully",
      customer
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create customer",
      error: error.message
    });
  }
});

// Get all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get customers",
      error: error.message
    });
  }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get customer",
      error: error.message
    });
  }
});

// Update customer
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json({
      message: "Customer updated successfully",
      customer
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update customer",
      error: error.message
    });
  }
});

// Delete customer
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json({
      message: "Customer deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete customer",
      error: error.message
    });
  }
});

module.exports = router;
