const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");

const ADMIN_NAME = "Nutrition Admin";
const ADMIN_ROLE = "admin";
const SALT_ROUNDS = 12;

const initializeAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      "Admin initialization skipped: ADMIN_EMAIL and ADMIN_PASSWORD must be configured."
    );
    return;
  }

  const normalizedEmail = adminEmail
    .trim()
    .toLowerCase();

  if (!normalizedEmail || !adminPassword.trim()) {
    console.warn(
      "Admin initialization skipped: ADMIN_EMAIL and ADMIN_PASSWORD cannot be empty."
    );
    return;
  }

  const existingAdmins = await Admin.find({
    email: normalizedEmail
  }).select("_id");

  if (existingAdmins.length > 1) {
    throw new Error(
      "Admin initialization aborted: duplicate admin accounts found for configured email."
    );
  }

  const passwordHash = await bcrypt.hash(
    adminPassword,
    SALT_ROUNDS
  );

  if (existingAdmins.length === 1) {
    await Admin.findByIdAndUpdate(
      existingAdmins[0]._id,
      {
        $set: {
          passwordHash,
          role: ADMIN_ROLE,
          active: true
        }
      },
      {
        runValidators: true
      }
    );

    console.log("Admin account initialized: existing account updated.");
    return;
  }

  await Admin.create({
    name: ADMIN_NAME,
    email: normalizedEmail,
    passwordHash,
    role: ADMIN_ROLE,
    active: true
  });

  console.log("Admin account initialized: new account created.");
};

module.exports = initializeAdmin;
