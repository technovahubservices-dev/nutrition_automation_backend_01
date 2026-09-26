const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NutritionPlan"
    },

    time: {
      type: String,
      required: true
    },

    activity: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    repeat: {
      type: String,
      enum: ["daily", "once"],
      default: "daily"
    },

    whatsappEnabled: {
      type: Boolean,
      default: true
    },

    enabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
