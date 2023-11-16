const Order = require("../models/orderModer");
const Ticket = require("../models/ticketModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const factoryBom = require("./handleFactoryBom");

exports.getAllOrders = factoryBom.getAll(Order, null, "groupTicket");
exports.getAllReport = factoryBom.getAllReport(Order, null, "groupTicket");
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

exports.updateOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const valiDoc = await Order.findById(orderId);
  if (valiDoc.state === "Pending") {
    await Order.findByIdAndUpdate(orderId, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const valiDoc = await Order.findById(orderId);
  if (valiDoc.state === "Pending") {
    const doc = await Order.findByIdAndUpdate(orderId, {
      state: "Canceled",
      allOfTicket: null,
    });
    if (doc.state === "Pending") {
      for (let i = 0; i < doc.allOfTicket.length; i++) {
        const ticketArr = doc.allOfTicket;
        await Ticket.findByIdAndUpdate(ticketArr[i], {
          state: "Pending",
          issuedDate: null,
        });
      }
    }
  }
  res.status(200).json({
    status: "success",
    data: null,
  });
});
exports.cancelManyOrder = catchAsync(async (req, res, next) => {
  const data = req.body.key;
  if (data.length) {
    for (let id of data) {
      const doc = await Order.findByIdAndUpdate(id, {
        state: "Canceled",
        allOfTicket: null,
      });
      if (doc.state === "Pending") {
        for (let i = 0; i < doc.allOfTicket.length; i++) {
          const ticketArr = doc.allOfTicket;
          await Ticket.findByIdAndUpdate(ticketArr[i], {
            state: "Pending",
            issuedDate: null,
          });
        }
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
exports.updateManyOrder = catchAsync(async (req, res, next) => {
  const data = req.body.key;
  if (data.length) {
    for (let id of data) {
      await Order.findByIdAndUpdate(
        id,
        { state: "Finished" },
        {
          new: true,
          runValidators: true,
        }
      );
    }
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
