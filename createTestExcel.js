const XLSX = require("xlsx");

const data = [
  {
    Time: "08:00 AM",
    Activity: "Water",
    Message: "Drink 2 glasses of water"
  },
  {
    Time: "10:00 AM",
    Activity: "Breakfast",
    Message: "Have your planned breakfast"
  },
  {
    Time: "01:00 PM",
    Activity: "Lunch",
    Message: "Time for lunch"
  },
  {
    Time: "04:30 PM",
    Activity: "Snack",
    Message: "Have your evening snack"
  },
  {
    Time: "06:00 PM",
    Activity: "Gym",
    Message: "Time for your workout"
  },
  {
    Time: "08:30 PM",
    Activity: "Dinner",
    Message: "Time for dinner"
  }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
  workbook,
  worksheet,
  "Nutrition Plan"
);

XLSX.writeFile(
  workbook,
  "Rahul_Nutrition_Plan.xlsx"
);

console.log("Test Excel file created successfully");
