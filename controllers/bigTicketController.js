const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const BigTicket = require("../models/bigTicketModel");
const GroupTicket = require("../models/groupTicketModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllBigTickets = factory.getAll(BigTicket, { path: "groupTickets" });
exports.getBigTicket = factory.getOne(BigTicket, "bigTicket", {
  path: "groupTickets",
});
exports.createBigTicket = factory.createOne(BigTicket);
exports.updateBigTicket = factory.updateOne(BigTicket, "bigTicket");
exports.deleteBigTicket = factory.deleteParentAndChildren(
  BigTicket,
  GroupTicket,
  "bigTicket"
);
exports.deleteMany = catchAsync(async (req, res, next) => {
  const data = req.body.key;
  if (data.length) {
    for (let id of data) {
      const parent = await BigTicket.findByIdAndDelete(id);
      if (parent) {
        await GroupTicket.deleteMany({ bigTicket: id });
      } else {
        return next(new AppError(`No bigTicket found with that ID`, 404));
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/image/BigTicket");
  },
  filename: function (req, file, cb) {
    console.log(file);
    const filename = req.params.id + "." + file.originalname.split(".")[1];
    cb(null, filename);
    req.body.logo = filename;
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== "jpeg") {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
});

const upload = multer({
  storage: storage,
});

exports.uploadImg = upload.fields([{ name: "logo", maxCount: 1 }]);
