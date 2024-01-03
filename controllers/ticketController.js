const Ticket = require("../models/ticketModel");
const BigTicket = require("../models/bigTicketModel");
const ImportHistory = require("../models/importHistoryModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const factoryBom = require("./handleFactoryBom");
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");
const AppError = require("../utils/appError");

exports.setGroupTicketUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.groupTicket) req.body.groupTicket = req.params.groupTicket;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllTickets = factoryBom.getAll(Ticket, null, "groupTicket");

exports.getTicket = factory.getOne(Ticket, "ticket");
exports.createTicket = factory.createOne(Ticket);
exports.updateTicket = factory.updateOne(Ticket, "ticket");

exports.deleteTicket = factory.deleteOne(Ticket, "ticket");
exports.deleteMany = factory.deleteMany(Ticket);

exports.importTicket = catchAsync(async (req, res, next) => {
  const data = req.body.data;
  const importUser = req.body.importUser;
  const importID = req.body.purchaseId;
  const reduceArr = data.reduce((acc, curr) => {
    let item = acc.find((el) => el.sku === curr.sku);
    if (item) {
      item.quantity += curr.quantity;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);
  const newArr = reduceArr.map((el) => {
    return {
      sku: el.sku,
      name: el.groupName,
      bigTicket: el.bigTicket,
      unit: el.unit,
      quantity: el.quantity,
    };
  });

  await Ticket.syncIndexes();
  try {
    await Ticket.create(data);
    res.status(200).json({
      status: "success",
      data: null,
    });
    await ImportHistory.create({
      importUser,
      importID,
      importType: 'Excel',
      ticket: newArr,
    });
  } catch (error) {
    return next(
      new AppError(`Mã serial: ${error.keyValue.serial} đã tồn tại`, 401)
    );
  }
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

exports.getGroupNumberTicket = catchAsync(async (req, res, next) => {
  const doc = await BigTicket.findById(
    req.query.bigTicket,
    "groupTickets"
  ).populate("groupTickets");
  const endDate = startOfDay(new Date(req.query.expiredDate));
  const startDate = endOfDay(new Date(req.query.expiredDate));
  const queryData = doc.groupTickets;
  const newArr = [];
  for (let i = 0; i < queryData.length; i++) {
    const ticketCount = await Ticket.countDocuments({
      groupTicket: queryData[i]._id,
      state: "Pending",
      activatedDate: { $lte: startDate },
      expiredDate: { $gte: endDate },
    });
    newArr.push(ticketCount);
  }

  res.status(200).json({
    status: "success",
    data: newArr,
  });
});
