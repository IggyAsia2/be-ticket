const GroupTicket = require("../models/groupTicketModel");
const factory = require("./handlerFactory");

exports.setBigTicketUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.bigTicket) req.body.bigTicket = req.params.bigTicket;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllGroupTickets = factory.getAll(
  GroupTicket,
  null,
  // { path: "tickets" },
  "bigTicket"
);
exports.getGroupTicket = factory.getOne(GroupTicket, "groupTickets", {
  path: "tickets",
});
exports.createGroupTicket = factory.createOne(GroupTicket);
exports.updateGroupTicket = factory.updateOne(GroupTicket, "groupTicket");
exports.deleteGroupTicket = factory.deleteOne(GroupTicket, "groupTicket");
