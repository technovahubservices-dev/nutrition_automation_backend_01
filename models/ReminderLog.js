const mongoose = require("mongoose");

const reminderLogSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    dateKey: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending"
    },

    triggeredAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

reminderLogSchema.index(
  {
    scheduleId: 1,
    dateKey: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model("ReminderLog", reminderLogSchema);
