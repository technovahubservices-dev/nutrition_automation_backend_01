const express = require("express");

const {
  sendWhatsAppMessage,
} = require("../services/whatsappService");

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const {
      sendNumber,
      message,
      templateName,
      templateLanguage,
      templateVariables,
    } = req.body || {};

    if (!sendNumber) {
      return res.status(400).json({
        success: false,
        error: "sendNumber is required",
      });
    }

    const data = await sendWhatsAppMessage({
      sendNumber,
      message,
      templateName,
      templateLanguage,
      templateVariables,
    });

    const whatsappMessageId =
      data?.messages?.[0]?.id || null;

    return res.status(200).json({
      success: true,
      message: "WhatsApp message sent successfully",
      whatsappMessageId,
      data,
    });
  } catch (error) {
    console.error(
      "[WhatsApp] Send failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;