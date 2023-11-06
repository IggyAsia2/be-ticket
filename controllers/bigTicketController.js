const BigTicket = require("../models/bigTicketModel");
const GroupTicket = require("../models/groupTicketModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");

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

