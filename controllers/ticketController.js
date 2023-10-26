const Ticket = require("../models/ticketModel");
const factory = require("./handlerFactory");


exports.setGroupTicketUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.groupTicketId) req.body.groupTicketId = req.params.groupTicketId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllTickets = factory.getAll(Ticket, null,
"groupTicketId");
exports.getTicket = factory.getOne(Ticket, "ticket");
exports.createTicket = factory.createOne(Ticket);
exports.updateTicket = factory.updateOne(Ticket, "ticket");
exports.deleteTicket = factory.deleteOne(Ticket, "ticket");