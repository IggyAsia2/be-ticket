const GroupTicket = require("../models/groupTicketModel");
const Ticket = require("../models/ticketModel");
const Order = require("../models/orderModer");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const APIFeaturesAdvanced = require("../utils/apiFeaturesAdvanced");
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");
const { FilterCount } = require("../helper/help");
const axios = require("axios");

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
// exports.getAllGroupTickets = catchAsync(async (req, res, next) => {
//   const doc = await GroupTicket.find({
//     bigTicket: {
//       $in: ["6565551bc93e031af0369c0a"
//       , "65655756c93e031af0369d80"
//     ],
//     },
//   });
//   res.status(200).json({
//     status: "success",
//     total: doc.length,
//     data: doc,
//   });
// });

exports.getAllGroupTickets = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.bigTicket) filter = { bigTicket: req.params.bigTicket };
  if (req.query.name) filter = { name: new RegExp(req.query.name, "i") };
  // const total = await GroupTicket.countDocuments();
  let dataBig;
  const queryLength = Object.getOwnPropertyNames(req.query).length;
  if (Object.getOwnPropertyNames(req.query)[queryLength - 1] === "bigTicket") {
    dataBig = req.query.bigTicket.split(",");
    Object.assign(filter, { bigTicket: { $in: dataBig } });
  }

  let query = GroupTicket.find(filter);

  const features = new APIFeaturesAdvanced(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const doc = await features.query;

  const total = await GroupTicket.countDocuments(
    FilterCount(filter, req.query, ["bigTicket", "sort"])
  );

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
        total,
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
  const {
    data,
    numberTickets,
    priceTicket,
    discountPrice,
    ticketId,
    exportUser,
  } = req.body;
  const { bookDate } = data;
  const newdate = bookDate.split("/").reverse().join("/");
  const arrTicket = [];
  for (let i = 0; i < numberTickets; i++) {
    const endDate = startOfDay(new Date(newdate));
    const startDate = endOfDay(new Date(newdate));
    const ticket = await Ticket.findOneAndUpdate(
      {
        groupTicket: ticketId,
        state: "Pending",
        activatedDate: { $lte: startDate },
        expiredDate: { $gte: endDate },
      },
      { state: "Delivered", issuedDate: Date.now() },
      { sort: { expiredDate: 1 } }
    );
    arrTicket.push({ id: ticket._id, serial: ticket.serial });
  }
  // Delivered

  let lastPost = await Order.find({ _id: { $exists: true } })
    .sort({ _id: -1 })
    .limit(1);
  let doc;
  const lastData = {
    ...data,
    allOfTicket: arrTicket,
    subTotal: priceTicket * numberTickets,
    price: priceTicket,
    discountPrice,
    discountSubtotal: discountPrice * numberTickets,
    bookDate: newdate,
    exportUser,
    paidDate: Date.now(),
    groupTicket: ticketId,
  };
  if (Array.isArray(lastPost) && lastPost.length > 0) {
    lastPost = lastPost[0];
    doc = await Order.create({
      ...lastData,
      orderId: lastPost["orderId"] + 1,
    });
  } else {
    doc = await Order.create({
      ...lastData,
    });
  }
  res.status(200).json({
    status: "success",
    data: null,
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

exports.exportGroupTicket = catchAsync(async (req, res, next) => {
  const {
    groupNumberTicket,
    priceTicket,
    discountTicket,
    data,
    exportUser,
    departID,
    bookDate,
  } = req.body;
  // console.log(priceTicket);
  const newdate = bookDate.split("/").reverse().join("/");
  for (let a = 0; a < groupNumberTicket.length; a++) {
    const arrTicket = [];
    for (let i = 0; i < groupNumberTicket[a][1]; i++) {
      const endDate = startOfDay(new Date(newdate));
      const startDate = endOfDay(new Date(newdate));
      const ticket = await Ticket.findOneAndUpdate(
        {
          groupTicket: groupNumberTicket[a][0],
          state: "Pending",
          activatedDate: { $lte: startDate },
          expiredDate: { $gte: endDate },
        },
        { state: "Delivered", issuedDate: Date.now() },
        { sort: { expiredDate: 1 } }
      );
      arrTicket.push({ id: ticket._id, serial: ticket.serial });
    }
    let lastPost = await Order.find({ _id: { $exists: true } })
      .sort({ _id: -1 })
      .limit(1);
    let doc;
    const whatPrice = priceTicket[groupNumberTicket[a][0]];
    const whatDiscountPrice = discountTicket[groupNumberTicket[a][0]];
    const lastData = {
      ...data,
      quantity: groupNumberTicket[a][1],
      allOfTicket: arrTicket,
      subTotal: whatPrice * groupNumberTicket[a][1],
      price: whatPrice,
      discountPrice: whatDiscountPrice,
      discountSubtotal: whatDiscountPrice * groupNumberTicket[a][1],
      bookDate: newdate,
      exportUser,
      departID,
      paidDate: Date.now(),
      groupTicket: groupNumberTicket[a][0],
    };
    if (Array.isArray(lastPost) && lastPost.length > 0) {
      lastPost = lastPost[0];
      doc = await Order.create({
        ...lastData,
        orderId: lastPost["orderId"] + 1,
      });
    } else {
      doc = await Order.create({
        ...lastData,
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.getMockData = catchAsync(async (req, res, next) => {
  const { groupTicket, count } = req.body;
  const newDate = new Date();
  const timTem = newDate.getTime();
  const options = {
    method: "POST",
    headers: {
      "X-API-Key": "2470e260",
    },
    url: `https://my.api.mockaroo.com/inven_api2.json?count=${count}`,
    data: {
      groupTicket,
      purchaseId: timTem,
      importUser: req.user.email,
      activatedDate: "2023-12-26",
      expiredDate: "2030-01-01",
      name: 'Vé tham quan'
    },
  };

  const mockData = await axios(options);

  await Ticket.create(mockData.data);

  res.status(200).json({
    status: "success",
  });
});

exports.exportAgentGroupTicket = catchAsync(async (req, res, next) => {
  const {
    groupNumberTicket,
    priceTicket,
    data,
    exportUser,
    departID,
    bookDate,
  } = req.body;
  const discountAgent = req.user.discountAgent;
  const newdate = bookDate.split("/").reverse().join("/");
  for (let a = 0; a < groupNumberTicket.length; a++) {
    const arrTicket = [];
    for (let i = 0; i < groupNumberTicket[a][1]; i++) {
      const endDate = startOfDay(new Date(newdate));
      const startDate = endOfDay(new Date(newdate));
      const ticket = await Ticket.findOneAndUpdate(
        {
          groupTicket: groupNumberTicket[a][0],
          state: "Pending",
          activatedDate: { $lte: startDate },
          expiredDate: { $gte: endDate },
        },
        { state: "Delivered", issuedDate: Date.now() },
        { sort: { expiredDate: 1 } }
      );
      arrTicket.push({ id: ticket._id, serial: ticket.serial });
    }
    let lastPost = await Order.find({ _id: { $exists: true } })
      .sort({ _id: -1 })
      .limit(1);
    const whatPrice = priceTicket[groupNumberTicket[a][0]];
    const lastData = {
      ...data,
      quantity: groupNumberTicket[a][1],
      allOfTicket: arrTicket,
      subTotal: whatPrice * groupNumberTicket[a][1],
      price: whatPrice,
      discountPrice: discountAgent,
      discountSubtotal: discountAgent * groupNumberTicket[a][1],
      bookDate: newdate,
      exportUser,
      isAgent: true,
      departID,
      paidDate: Date.now(),
      groupTicket: groupNumberTicket[a][0],
    };
    if (Array.isArray(lastPost) && lastPost.length > 0) {
      lastPost = lastPost[0];
      doc = await Order.create({
        ...lastData,
        orderId: lastPost["orderId"] + 1,
      });
    } else {
      doc = await Order.create({
        ...lastData,
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
