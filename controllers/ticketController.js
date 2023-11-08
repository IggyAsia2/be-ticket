const Ticket = require("../models/ticketModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");

exports.setGroupTicketUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.groupTicket) req.body.groupTicket = req.params.groupTicket;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllTickets = factory.getAll(Ticket, null, "groupTicket");
exports.getTicket = factory.getOne(Ticket, "ticket");
exports.createTicket = factory.createOne(Ticket);
exports.updateTicket = factory.updateOne(Ticket, "ticket");

exports.deleteTicket = factory.deleteOne(Ticket, "ticket");
exports.deleteMany = factory.deleteMany(Ticket);

exports.importTicket = catchAsync(async (req, res, next) => {
  const data = req.body.data;
  await Ticket.create(data);
  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.getNumberTicketByDay = catchAsync(async (req, res, next) => {
  const groupTicket = req.query.groupTicket;
  const endDate = startOfDay(new Date(req.query.expiredDate));
  const startDate = endOfDay(new Date(req.query.expiredDate));
  const ticketCount = await Ticket.countDocuments({
    groupTicket,
    state: "Pending",
    activatedDate: { $lte: startDate },
    expiredDate: { $gte: endDate },
  });
  res.status(200).json({
    status: "success",
    available: ticketCount,
  });
});
