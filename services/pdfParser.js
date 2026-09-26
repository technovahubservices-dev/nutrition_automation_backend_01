const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const TIME_PATTERN =
  /^\s*(\d{1,2}(?::|\.)?\d{0,2}\s*(?:AM|PM)|\d{1,2}:\d{2})\s*/i;

const normalizeTime = (value) => {
  return String(value)
    .replace(/\./g, ":")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
};

const cleanText = (value) => {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
    .replace(/^[|•▪●\-–—]+\s*/, "")
    .trim();
};

const splitScheduleContent = (content) => {
  let value = cleanText(content);

  value = value.replace(/^\s*[-–—:|]+\s*/, "");

  if (!value) {
    return {
      activity: "",
      message: ""
    };
  }

  // Format:
  // Activity - Message
  const separatorMatch = value.match(
    /\s+[-–—]\s+/
  );

  if (separatorMatch) {
    const index = separatorMatch.index;

    const activity = cleanText(
      value.substring(0, index)
    );

    const message = cleanText(
      value.substring(
        index + separatorMatch[0].length
      )
    );

    return {
      activity,
      message: message || activity
    };
  }

  // Format:
  // Activity | Message
  const pipeParts = value
    .split("|")
    .map(cleanText)
    .filter(Boolean);

  if (pipeParts.length >= 2) {
    return {
      activity: pipeParts[0],
      message: pipeParts.slice(1).join(" | ")
    };
  }

  return {
    activity: value,
    message: value
  };
};

const parseNutritionPdf = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error("PDF file could not be found");
  }

  const buffer = fs.readFileSync(filePath);

  const parser = new PDFParse({
    data: buffer
  });

  try {
    const result = await parser.getText();

    const text = String(result.text || "")
      .replace(/\r/g, "")
      .trim();

    if (!text) {
      throw new Error(
        "PDF does not contain readable text"
      );
    }

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const schedules = [];

    let current = null;

    const saveCurrent = () => {
      if (!current) {
        return;
      }

      const content = cleanText(
        current.content.join(" ")
      );

      if (!content) {
        current = null;
        return;
      }

      const parsed = splitScheduleContent(
        content
      );

      if (!parsed.activity) {
        current = null;
        return;
      }

      schedules.push({
        time: current.time,
        activity: parsed.activity,
        message: parsed.message
      });

      current = null;
    };

    for (const line of lines) {
      const timeMatch = line.match(
        TIME_PATTERN
      );

      if (timeMatch) {
        saveCurrent();

        const rawTime = timeMatch[1];

        const remaining = line
          .substring(timeMatch[0].length)
          .trim();

        current = {
          time: normalizeTime(rawTime),
          content: remaining
            ? [remaining]
            : []
        };

        continue;
      }

      const normalizedLine = line
        .toLowerCase()
        .replace(/[:|]/g, "")
        .trim();

      if (
        [
          "nutrition plan",
          "nutrition schedule",
          "daily nutrition plan",
          "time activity message",
          "time activity",
          "schedule"
        ].includes(normalizedLine)
      ) {
        continue;
      }

      // Handles wrapped PDF text.
      if (current) {
        current.content.push(line);
      }
    }

    saveCurrent();

    if (!schedules.length) {
      throw new Error(
        "Could not extract a schedule from the PDF. Use entries such as: 08:00 AM Water - Drink water"
      );
    }

    return schedules;
  } finally {
    await parser.destroy();
  }
};

module.exports = {
  parseNutritionPdf
};

