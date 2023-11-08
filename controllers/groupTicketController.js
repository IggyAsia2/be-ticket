const GroupTicket = require("../models/groupTicketModel");
const Ticket = require("../models/ticketModel");
const Order = require("../models/orderModer");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");

exports.setBigTicketUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.bigTicket) req.body.bigTicket = req.params.bigTicket;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// exports.getAllGroupTickets = factory.getAll(
//   GroupTicket,
//   null,
//   "bigTicket"
// );
exports.getAllGroupTickets = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.bigTicket) filter = { bigTicket: req.params.bigTicket };
  if (req.query.name) filter = { name: new RegExp(req.query.name, "i") };
  const total = await GroupTicket.countDocuments();

  let query = GroupTicket.find(filter);

  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const doc = await features.query;

  async function stockFunc() {
    return doc.map(async (el) => {
      const numberDelivered = await Ticket.where({
        groupTicket: el._id,
        state: "Delivered",
      }).countDocuments();
      const numberPending = await Ticket.where({
        groupTicket: el._id,
        state: "Pending",
      }).countDocuments();
      return {
        ...el._doc,
        delivered: numberDelivered,
        pending: numberPending,
      };
    });
  }

  stockFunc()
    .then((data) => Promise.all(data))
    .then((newDoc) =>
      res.status(200).json({
        status: "success",
        current: req.query.current * 1 || 1,
        pageSize: req.query.pageSize * 1 || 10,
        total: newDoc.length,
        data: newDoc,
      })
    )
    .catch((err) => console.error(err));
});
exports.getGroupTicket = factory.getOne(GroupTicket, "groupTickets", {
  path: "tickets",
});
exports.createGroupTicket = factory.createOne(GroupTicket);
exports.updateGroupTicket = factory.updateOne(GroupTicket, "groupTicket");
exports.updateStock = catchAsync(async (req, res, next) => {
  const numberStock = await Ticket.where({
    groupTicket: req.params.id,
    state: "Delivered",
  }).countDocuments();

  const doc = await GroupTicket.findByIdAndUpdate(
    req.params.id,
    {
      stock: numberStock,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!doc) {
    return next(new AppError(`No ${name} found with that ID`, 404));
  }

  res.status(200).json({
    status: "success",
    data: doc,
  });
});
exports.deleteGroupTicket = factory.deleteParentAndChildren(
  GroupTicket,
  Ticket,
  "groupTicket"
);
// exports.deleteMany = factory.deleteMany(GroupTicket);

exports.exportTicket = catchAsync(async (req, res, next) => {
  const { data, numberTickets, ticketId, exportUser } = req.body;
  const { customerName, customerEmail, customerPhone, bookDate, quantity } =
    data;
  const newdate = bookDate.split("/").reverse().join("/");
  for (let i = 0; i < numberTickets; i++) {
    const endDate = startOfDay(new Date(newdate));
    const startDate = endOfDay(new Date(newdate));
    await Ticket.findOneAndUpdate(
      {
        groupTicket: ticketId,
        state: "Pending",
        activatedDate: { $lte: startDate },
        expiredDate: { $gte: endDate },
      },
      { state: "Delivered", issuedDate: Date.now() },
      { sort: { expiredDate: 1 } }
    );
  }

  let lastPost = await Order.find({ _id: { $exists: true } })
    .sort({ _id: -1 })
    .limit(1);
  let doc;
  if (Array.isArray(lastPost) && lastPost.length > 0) {
    lastPost = lastPost[0];
    doc = await Order.create({
      ...data,
      bookDate: newdate,
      exportUser,
      paidDate: Date.now(),
      groupTicket: ticketId,
      orderId: lastPost["orderId"] + 1,
    });
  } else {
    doc = await Order.create({
      ...data,
      bookDate: newdate,
      exportUser,
      paidDate: Date.now(),
      groupTicket: ticketId,
    });
  }
  res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.deleteMany = catchAsync(async (req, res, next) => {
  const data = req.body.key;
  if (data.length) {
    for (let id of data) {
      const parent = await GroupTicket.findByIdAndDelete(id);
      if (parent) {
        await Ticket.deleteMany({ groupTicket: id });
      } else {
        return next(new AppError(`No groupTicket found with that ID`, 404));
      }
    }
  }
  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.getAllForImport = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.query.name) filter = { name: new RegExp(req.query.name, "i") };
  let query = GroupTicket.find(filter);
  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const doc = await features.query;
  res.status(200).json({
    status: "success",
    data: doc,
  });
});
