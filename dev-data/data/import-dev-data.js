const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
// const Diary = require("../../models/diaryModel");
// const Arrival = require("../../models/arrivalModel");
const User = require("../../models/userModel");
// const Product = require("../../models/productModel");
// const Truck = require("../../models/truckModel");
const Role = require("../../models/Permission/roleModel");
const Right = require("../../models/Permission/rightModel");
const RightGroup = require("../../models/Permission/rightGroupModel");

dotenv.config({ path: "./.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log("DB connection successfull!");
  });

// Import data into database
const importData = async (model, bool) => {
  const items = JSON.parse(
    fs.readFileSync(`${__dirname}/${model}.json`, "utf-8")
  );
  try {
    switch (model) {
      case "User":
        if (bool) await User.deleteMany();
        await User.create(items);
        break;
      case "Product":
        if (bool) await Product.deleteMany();
        await Product.create(items);
        break;
      case "Diary":
        if (bool) await Diary.deleteMany();
        await Diary.create(items);
        break;
      case "Arrival":
        if (bool) await Arrival.deleteMany();
        await Arrival.create(items);
        break;
      case "Truck":
        if (bool) await Truck.deleteMany();
        await Truck.create(items);
        break;
      case "Role":
        if (bool) await Role.deleteMany();
        await Role.create(items);
        break;
      case "Right":
        if (bool) await Right.deleteMany();
        await Right.create(items);
        break;
      case "RightGroup":
        if (bool) await RightGroup.deleteMany();
        await RightGroup.create(items);
        break;
    }

    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all data from collection
const deleteData = async (model) => {
  try {
    switch (model) {
      case "User":
        await User.deleteMany();
        break;
      case "Product":
        await Product.deleteMany();
        break;
      case "Diary":
        await Diary.deleteMany();
        break;
      case "Arrival":
        await Arrival.deleteMany();
        break;
      case "Truck":
        await Truck.deleteMany();
        break;
      case "Role":
        await Role.deleteMany();
        break;
      case "Right":
        await Right.deleteMany();
        break;
      case "RightGroup":
        await RightGroup.deleteMany();
        break;
    }
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const modelName = process.argv[4];
const action = process.argv[2];

switch (action) {
  case "--import":
    if (process.argv[3] === "new") {
      importData(modelName, true);
    } else {
      importData(modelName, false);
    }
    break;
  case "--delete":
    deleteData(modelName);
    break;
}
// node ./dev-data/data/import-dev-data.js --import new Product
