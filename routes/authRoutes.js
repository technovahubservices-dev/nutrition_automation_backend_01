const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Admin registration
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingAdmin = await Admin.findOne({
      email: normalizedEmail
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin already exists with this email"
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Admin registration failed",
      error: error.message
    });
  }
});

// Admin login
router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const admin = await Admin.findOne({
      email: normalizedEmail
    });

    if (!admin || !admin.active) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        admin.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        role: admin.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Admin login failed",
      error: error.message
    });
  }
});

// Logged-in admin profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(
      req.admin.adminId
    ).select("-passwordHash");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    res.json({
      admin
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get admin profile",
      error: error.message
    });
  }
});

module.exports = router;
