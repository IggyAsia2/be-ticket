const Order = require("../models/orderModer");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllOrders = factory.getAll(Order);
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
