const cron = require("node-cron");

const Schedule = require("../models/Schedule");
const ReminderLog = require("../models/ReminderLog");

const {
  parseScheduleTime,
  getCurrentTimeInTimezone
} = require("../utils/timeUtils");

let schedulerRunning = false;

const processSchedules = async () => {
  if (schedulerRunning) {
    console.log(
      "[SCHEDULER] Previous run is still running. Skipping this cycle."
    );
    return;
  }

  schedulerRunning = true;

  try {
    const schedules = await Schedule.find({
      enabled: true,
      repeat: "daily"
    }).populate(
      "customerId",
      "name phone whatsappNumber timezone active"
    );

    if (!schedules.length) {
      return;
    }

    for (const schedule of schedules) {
      try {
        const customer = schedule.customerId;

        if (!customer || !customer.active) {
          continue;
        }

        const timezone =
          customer.timezone || "Asia/Kolkata";

        const current =
          getCurrentTimeInTimezone(timezone);

        const scheduled =
          parseScheduleTime(schedule.time);

        if (
          current.hour !== scheduled.hour ||
          current.minute !== scheduled.minute
        ) {
          continue;
        }

        const dateKey = current.dateKey;

        try {
          const reminder = await ReminderLog.create({
            scheduleId: schedule._id,
            customerId: customer._id,
            dateKey,
            status: "pending"
          });

          console.log(
            `[REMINDER DUE] ${customer.name} | ${schedule.time} | ${schedule.activity} | ${schedule.message}`
          );

          console.log(
            `Reminder ID: ${reminder._id}`
          );
        } catch (error) {
          if (error.code === 11000) {
            console.log(
              `[ALREADY PROCESSED] ${customer.name} | ${schedule.time} | ${schedule.activity}`
            );

            continue;
          }

          throw error;
        }
      } catch (scheduleError) {
        console.error(
          `Scheduler error for schedule ${schedule._id}:`,
          scheduleError.message
        );
      }
    }
  } catch (error) {
    console.error(
      "[SCHEDULER ERROR]",
      error.message
    );
  } finally {
    schedulerRunning = false;
  }
};

const startScheduler = () => {
  console.log("Reminder scheduler started");

  cron.schedule("* * * * *", processSchedules);
};

module.exports = {
  startScheduler,
  processSchedules
};
