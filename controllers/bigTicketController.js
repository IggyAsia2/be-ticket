const BigTicket = require("../models/bigTicketModel");
const GroupTicket = require("../models/groupTicketModel");
const factory = require("./handlerFactory");

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
