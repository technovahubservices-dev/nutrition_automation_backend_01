const mongoose = require("mongoose");

const nutritionPlanSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    fileName: {
      type: String,
      required: true,
      trim: true
    },

    fileType: {
      type: String,
      enum: ["excel", "pdf"],
      required: true
    },

    fileUrl: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["uploaded", "processed", "failed"],
      default: "uploaded"
    },

    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("NutritionPlan", nutritionPlanSchema);
