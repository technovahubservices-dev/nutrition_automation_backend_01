const parseScheduleTime = (timeString) => {
  const value = String(timeString).trim().toUpperCase();

  const match = value.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
  );

  if (!match) {
    throw new Error(
      `Invalid schedule time: ${timeString}. Expected format like 08:30 PM`
    );
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3];

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    throw new Error(`Invalid schedule time: ${timeString}`);
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  return {
    hour,
    minute
  };
};

const getCurrentTimeInTimezone = (timezone) => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(now);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour) === 24 ? 0 : Number(values.hour),
    minute: Number(values.minute)
  };
};

module.exports = {
  parseScheduleTime,
  getCurrentTimeInTimezone
};
