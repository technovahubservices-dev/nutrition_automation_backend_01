const XLSX = require("xlsx");

const normalizeRow = (row, index) => {
  const time = String(
    row.Time ??
    row.time ??
    row.TIME ??
    ""
  ).trim();

  const activity = String(
    row.Activity ??
    row.activity ??
    row.ACTIVITY ??
    ""
  ).trim();

  const message = String(
    row.Message ??
    row.message ??
    row.MESSAGE ??
    activity
  ).trim();

  if (!time || !activity) {
    throw new Error(
      `Invalid row ${index + 2}: Time and Activity are required`
    );
  }

  return {
    time,
    activity,
    message
  };
};

const parseNutritionSpreadsheet = (filePath) => {
  const workbook = XLSX.readFile(filePath);

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error(
      "Spreadsheet does not contain any sheet"
    );
  }

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(
    worksheet,
    {
      defval: ""
    }
  );

  if (!rows.length) {
    throw new Error("Spreadsheet is empty");
  }

  return rows.map(normalizeRow);
};

const parseNutritionExcel =
  parseNutritionSpreadsheet;

module.exports = {
  parseNutritionExcel,
  parseNutritionSpreadsheet
};
