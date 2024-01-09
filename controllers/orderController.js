const Order = require("../models/orderModer");
const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const factoryBom = require("./handleFactoryBom");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
// const { htmlTemplate } = require("../helper/ticketMailTemplate");

exports.getAllOrders = factoryBom.getAll(Order, null, "groupTicket");
exports.getAllReport = factoryBom.getAllReport(Order, null, "groupTicket");
exports.getOrder = factory.getOne(Order, "order");
exports.getLinkOrder = factory.getOne(Order, "order");
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
  if (valiDoc.state === "Pending" && req.body.state === "Finished") {
    await Order.findByIdAndUpdate(
      orderId,
      { state: req.body.state },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  const { isUp } = req.body;

  if (valiDoc.state === "Finished" && isUp === true) {
    await Order.findByIdAndUpdate(orderId, req.body, {
      new: true,
      runValidators: true,
    });
  }
  res.status(200).json({
    status: "success",
    data: null,
    // data: valiDoc,
  });
});

exports.updateAgentOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const valiDoc = await Order.findById(orderId);
  const userDoc = req.user; 
  if (valiDoc.state === "Pending") {
    if (valiDoc.isAgent && userDoc.isAgent) {
      const monery = valiDoc.subTotal - valiDoc.discountSubtotal;
      const newMoney = userDoc.moneny - monery;
      if (userDoc.moneny > monery) {
        await User.findByIdAndUpdate(userDoc._id, {
          moneny: newMoney,
        });
        await Order.findByIdAndUpdate(orderId, req.body, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({
          status: "success",
          data: null,
        });
      } else {
        res.status(400).json({
          status: "error",
          message: "Tài khoản không đủ tiền vui lòng nạp thêm!",
        });
      }
    }
  }
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

exports.updateThor = catchAsync(async (req, res, next) => {
  const data = req.body.key;
  const { customerName, customerCar, customerPhone } = req.body;
  if (data.length) {
    for (let id of data) {
      const valiDoc = await Order.findById(id);
      if (valiDoc.state === "Finished") {
        await Order.findByIdAndUpdate(
          id,
          { customerName, customerCar: customerCar.toLowerCase(), customerPhone },
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

// exports.updateAgentManyOrder = catchAsync(async (req, res, next) => {
//   const data = req.body.key;
//   const userDoc = req.user;
//   if (data.length) {
//     for (let id of data) {
//       const valiDoc = await Order.findById(id);
//       if (valiDoc.state === "Pending") {
//         if (valiDoc.isAgent && userDoc.isAgent) {
//           const monery = valiDoc.subTotal - valiDoc.discountSubtotal;
//           const newMoney = userDoc.moneny - monery;
//           if (userDoc.moneny > monery) {
//             await User.findByIdAndUpdate(userDoc._id, {
//               moneny: newMoney,
//             });
//             await Order.findByIdAndUpdate(
//               id,
//               { status: "Pending" },
//               {
//                 new: true,
//                 runValidators: true,
//               }
//             );
//             res.status(200).json({
//               status: "success",
//               data: null,
//             });
//           } else {
//             res.status(400).json({
//               status: "error",
//               message: "Tài khoản không đủ tiền vui lòng nạp thêm!",
//             });
//           }
//         }
//       }
//     }
//   }

//   res.status(200).json({
//     status: "success",
//     data: null,
//   });
// });

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

exports.statisticDriver = catchAsync(async (req, res, next) => {
  const customerPhone = req.query.phone;
  const count = await Order.countDocuments({ customerPhone });
  res.status(200).json({
    status: "success",
    data: count,
  });
});
