const Order = require("../models/orderModer");
const Ticket = require("../models/ticketModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const factoryBom = require("./handleFactoryBom");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
// const { htmlTemplate } = require("../helper/ticketMailTemplate");

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

exports.reduceOrder = catchAsync(async (req, res, next) => {
  const { oid, newQuan, rmQuan, newSubtotal, newDiscountTotal } = req.body;
  const valiDoc = await Order.findById(oid);

  const sliceArrTicket = valiDoc.allOfTicket.slice(rmQuan * -1);
  const newArrTicket = valiDoc.allOfTicket.slice(0, newQuan);

  if (
    valiDoc.state === "Pending" &&
    valiDoc.quantity > 1 &&
    valiDoc.quantity > newQuan
  ) {
    for (let i = 0; i < sliceArrTicket.length; i++) {
      await Ticket.findByIdAndUpdate(sliceArrTicket[i].id, {
        state: "Pending",
        issuedDate: null,
      });
    }
    await Order.findByIdAndUpdate(oid, {
      allOfTicket: newArrTicket,
      quantity: newQuan,
      subTotal: newSubtotal,
      discountSubtotal: newDiscountTotal,
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
    for (let i = 0; i < valiDoc.allOfTicket.length; i++) {
      const ticketArr = valiDoc.allOfTicket;
      await Ticket.findByIdAndUpdate(ticketArr[i].id, {
        state: "Pending",
        issuedDate: null,
      });
    }
    await Order.findByIdAndUpdate(orderId, {
      state: "Canceled",
      allOfTicket: null,
    });
  }
  res.status(200).json({
    status: "success",
    data: valiDoc,
  });
});

exports.cancelManyOrder = catchAsync(async (req, res, next) => {
  const data = req.body.key;
  if (data.length) {
    for (let id of data) {
      const valiDoc = await Order.findById(id);
      if (valiDoc.state === "Pending") {
        const doc = await Order.findByIdAndUpdate(id, {
          state: "Canceled",
          allOfTicket: null,
        });
        if (doc.state === "Pending") {
          for (let i = 0; i < doc.allOfTicket.length; i++) {
            const ticketArr = doc.allOfTicket;
            await Ticket.findByIdAndUpdate(ticketArr[i].id, {
              state: "Pending",
              issuedDate: null,
            });
          }
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
      const valiDoc = await Order.findById(id);
      if (valiDoc.state === "Pending") {
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
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.sendEmailOrder = catchAsync(async (req, res, next) => {
  const { email, subject, html } = req.body;
  const message = `Xuất vé thành công`;

  try {
    await sendEmail({
      email,
      subject,
      message,
      html,
    });

    res.status(200).json({
      status: "success",
      message: "Ticket sent to email",
    });
  } catch (err) {
    return next(
      new AppError("There was an error sending the email. Try again later!")
    );
  }
});
