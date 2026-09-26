require("dotenv").config();

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const customerRoutes = require("./routes/customerRoutes");
const nutritionPlanRoutes = require("./routes/nutritionPlanRoutes");
const nutritionPlanUploadRoutes = require("./routes/nutritionPlanUploadRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const authRoutes = require("./routes/authRoutes");
const whatsappRoutes = require("./routes/whatsapproutes");

const { startScheduler } = require("./services/scheduler");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/nutrition-plans", nutritionPlanRoutes);
app.use("/api/nutrition-plans", nutritionPlanUploadRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/whatsapp", whatsappRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Nutrition Automation Backend is running"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  startScheduler();
});

