const GroupTicket = require("../models/groupTicketModel");
const factory = require("./handlerFactory");

exports.setBigTicketUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.bigTicketId) req.body.bigTicketId = req.params.bigTicketId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllGroupTickets = factory.getAll(
  GroupTicket,
  null,
  // { path: "tickets" },
  "bigTicketId"
);
exports.getGroupTicket = factory.getOne(GroupTicket, "groupTickets", {
  path: "tickets",
});
exports.createGroupTicket = factory.createOne(GroupTicket);
exports.updateGroupTicket = factory.updateOne(GroupTicket, "groupTicket");
exports.deleteGroupTicket = factory.deleteOne(GroupTicket, "groupTicket");
