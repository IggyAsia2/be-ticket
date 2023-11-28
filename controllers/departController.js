const Depart = require("../models/departModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllDeparts = factory.getAll(Depart);
exports.getDepart = factory.getOne(Depart, "depart");
exports.createDepart = factory.createOne(Depart);
exports.updateDepart = factory.updateOne(Depart, "depart", ["cashiers"]);
exports.deleteDepart = factory.deleteOne(Depart, "depart");

exports.updateCashier = catchAsync(async (req, res, next) => {
  const { id, cashID } = req.params;
  const { order, name } = req.body;
  let obj = {};
  if (name) obj["cashiers.$[i].name"] = name;
  if (order) obj["cashiers.$[i].order"] = order;
  console.log(obj);
  const updateDocument = {
    $set: { ...obj },
  };

  const options = {
    arrayFilters: [
      {
        "i._id": cashID,
      },
    ],
  };
  await Depart.findByIdAndUpdate(id, updateDocument, options);
  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.insertCashier = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const insertDocument = {
    $push: { cashiers: { ...req.body } },
  };

  await Depart.findByIdAndUpdate(id, insertDocument);
  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.deleteCashier = catchAsync(async (req, res, next) => {
  const { id, cashID } = req.params;
  const deleteDocument = {
    $pull: { cashiers: { _id: cashID } },
  };

  await Depart.findByIdAndUpdate(id, deleteDocument);
  res.status(200).json({
    status: "success",
    data: null,
  });
});
