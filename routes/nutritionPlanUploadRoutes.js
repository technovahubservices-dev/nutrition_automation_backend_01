const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Customer = require("../models/Customer");
const NutritionPlan = require("../models/NutritionPlan");
const Schedule = require("../models/Schedule");

const {
  parseNutritionSpreadsheet
} = require("../services/excelParser");

const {
  parseNutritionPdf
} = require("../services/pdfParser");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

const upload = multer({
  dest: "uploads/"
});

const removeUploadedFile = (filePath) => {
  if (
    filePath &&
    fs.existsSync(filePath)
  ) {
    fs.unlinkSync(filePath);
  }
};

const getFileType = (file) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    extension === ".xlsx" ||
    extension === ".xls" ||
    extension === ".csv"
  ) {
    return "excel";
  }

  if (extension === ".pdf") {
    return "pdf";
  }

  return null;
};

// Upload + parse + return preview
router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const { customerId } = req.body;

      if (!req.file) {
        return res.status(400).json({
          message: "Nutrition plan file is required"
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          customerId
        )
      ) {
        removeUploadedFile(req.file.path);

        return res.status(400).json({
          message: "Invalid customer ID"
        });
      }

      const customer =
        await Customer.findById(customerId);

      if (!customer) {
        removeUploadedFile(req.file.path);

        return res.status(404).json({
          message: "Customer not found"
        });
      }

      const fileType = getFileType(req.file);

      if (!fileType) {
        removeUploadedFile(req.file.path);

        return res.status(400).json({
          message:
            "Unsupported file type. Use XLSX, XLS, CSV or PDF."
        });
      }

      let schedules;

      if (fileType === "excel") {
        schedules =
          parseNutritionSpreadsheet(
            req.file.path
          );
      } else {
        schedules =
          await parseNutritionPdf(
            req.file.path
          );
      }

      if (!schedules.length) {
        throw new Error(
          "No schedule entries were extracted"
        );
      }

      /*
       * Important:
       * Do NOT create Schedule records here.
       *
       * The admin must first review and confirm
       * the extracted schedule.
       */

      const plan =
        await NutritionPlan.create({
          customerId,
          fileName:
            req.file.originalname,
          fileType,
          status: "uploaded"
        });

      removeUploadedFile(req.file.path);

      return res.status(201).json({
        message:
          "Nutrition plan uploaded and parsed. Review the preview before confirming.",
        plan,
        preview: schedules
      });
    } catch (error) {
      if (req.file) {
        removeUploadedFile(
          req.file.path
        );
      }

      return res.status(500).json({
        message:
          "Failed to upload and parse nutrition plan",
        error: error.message
      });
    }
  }
);

// Confirm admin-reviewed schedule
router.post(
  "/:planId/confirm",
  async (req, res) => {
    try {
      const { planId } = req.params;
      const { schedules } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          planId
        )
      ) {
        return res.status(400).json({
          message: "Invalid nutrition plan ID"
        });
      }

      if (
        !Array.isArray(schedules) ||
        schedules.length === 0
      ) {
        return res.status(400).json({
          message:
            "At least one schedule entry is required"
        });
      }

      const plan =
        await NutritionPlan.findById(planId);

      if (!plan) {
        return res.status(404).json({
          message: "Nutrition plan not found"
        });
      }

      if (plan.status !== "uploaded") {
        return res.status(400).json({
          message:
            "This nutrition plan has already been processed or cannot be confirmed."
        });
      }

      const customer =
        await Customer.findById(
          plan.customerId
        );

      if (!customer) {
        return res.status(404).json({
          message: "Customer not found"
        });
      }

      const cleanedSchedules =
        schedules.map((item, index) => {
          const time = String(
            item.time || ""
          ).trim();

          const activity = String(
            item.activity || ""
          ).trim();

          const message = String(
            item.message || activity
          ).trim();

          if (!time || !activity) {
            throw new Error(
              `Schedule row ${index + 1}: time and activity are required`
            );
          }

          return {
            customerId: customer._id,
            planId: plan._id,
            time,
            activity,
            message,
            repeat:
              item.repeat === "once"
                ? "once"
                : "daily",
            whatsappEnabled:
              item.whatsappEnabled !== false,
            enabled:
              item.enabled !== false
          };
        });

      /*
       * Activate this plan as the patient's current plan.
       *
       * Disable schedules belonging to older plans for this
       * patient so the scheduler cannot process multiple plans.
       */

      await Schedule.updateMany(
        {
          customerId: customer._id,
          planId: { $ne: plan._id },
          enabled: true
        },
        {
          $set: {
            enabled: false
          }
        }
      );

      // Remove any schedules previously created for this plan
      await Schedule.deleteMany({
        customerId: customer._id,
        planId: plan._id
      });

      const createdSchedules =
        await Schedule.insertMany(
          cleanedSchedules
        );

      plan.status = "processed";

      await plan.save();

      return res.json({
        message:
          "Nutrition plan confirmed and schedule activated successfully",
        plan,
        schedules: createdSchedules
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to confirm nutrition plan",
        error: error.message
      });
    }
  }
);

module.exports = router;


