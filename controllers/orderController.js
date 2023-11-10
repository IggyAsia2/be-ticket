const Order = require("../models/orderModer");
const Ticket = require("../models/ticketModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const factoryBom = require("./handleFactoryBom");

exports.getAllOrders = factoryBom.getAll(Order, null, "groupTicket");
exports.getOrder = factory.getOne(Order, "order");
exports.createOrder = catchAsync(async (req, res, next) => {
  let lastPost = await Order.find({ _id: { $exists: true } })
    .sort({ _id: -1 })
    .limit(1);
  let doc;
  if (Array.isArray(lastPost) && lastPost.length > 0) {
    lastPost = lastPost[0];
    doc = await Order.create({
      ...req.body,
      orderId: lastPost["orderId"] + 1,
    });
  } else {
    doc = await Order.create(req.body);
  }

  res.status(201).json({
    status: "success",
    data: doc,
  });
});
exports.updateOrder = factory.updateOne(Order, "order");

exports.deleteOrder = factory.deleteOne(Order, "order");
exports.deleteMany = factory.deleteMany(Order);
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const doc = await Order.findByIdAndUpdate(req.params.id, { state: "Canceled" });
  if (doc.state === "Pending") {
    for (let i = 0; i < doc.allOfTicket.length; i++) {
      const ticketArr = doc.allOfTicket;
      await Ticket.findByIdAndUpdate(ticketArr[i], {
        state: "Pending",
        issuedDate: null,
      });
    }
  }
  res.status(200).json({
    status: "success",
    data: null,
  });
});
