const catchAsync = require("../utils/catchAsync");
const GroupTicket = require("../models/groupTicketModel");
const User = require("../models/userModel");
const APIFeaturesAdvanced = require("../utils/apiFeaturesAdvanced");
const { groupByFuc, getUserId } = require("../helper/arrayHelper");

const selfOrderArr = ["sale", "agent"];

exports.getAll = (Model, popOptions, virtualId) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET arrivals on diary
    let filter = {};
    if (
      req.baseUrl === "/api/v1/orders" &&
      selfOrderArr.includes(req.user.role.name)
    ) {
      Object.assign(filter, {
        exportUser: req.user.email,
      });
    }
    let dataBig;
    const queryLength = Object.getOwnPropertyNames(req.query).length;
    if (
      Object.getOwnPropertyNames(req.query)[queryLength - 1] === "bigTicket"
    ) {
      dataBig = await GroupTicket.find(
        {
          bigTicket: req.query.bigTicket,
        },
        "_id"
      ).exec();
      dataBig = dataBig.map((el) => el._id.toString());
      Object.assign(filter, { groupTicket: { $in: dataBig } });
    }

    if (req.params[virtualId]) filter = { [virtualId]: req.params[virtualId] };
    if (req.query.name) filter = { name: new RegExp(req.query.name, "i") };
    // Execute Query

    let query = Model.find(filter);

    if (popOptions) query.populate(popOptions);

    const features = new APIFeaturesAdvanced(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const doc = await features.query;
    const total = await Model.countDocuments(filter);


    const pagi = {
      current: req.query.current * 1 || 1,
      pageSize: req.query.pageSize * 1 || 10,
      total: total,
    };

    res.status(200).json({
      status: "success",
      ...pagi,
      data: doc,
    });
  });

exports.getAllReport = (Model, popOptions, virtualId) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET arrivals on diary
    let filter = {};
    let dataBig;
    const queryLength = Object.getOwnPropertyNames(req.query).length;
    if (
      Object.getOwnPropertyNames(req.query)[queryLength - 1] === "bigTicket"
    ) {
      dataBig = await GroupTicket.find(
        {
          bigTicket: req.query.bigTicket,
        },
        "_id"
      ).exec();
      dataBig = dataBig.map((el) => el._id.toString());
      filter = { groupTicket: { $in: dataBig } };
    }

    if (req.params[virtualId]) filter = { [virtualId]: req.params[virtualId] };
    if (req.query.name) filter = { name: new RegExp(req.query.name, "i") };
    // Execute Query

    let query = Model.find(filter);

    if (popOptions) query.populate(popOptions);

    const features = new APIFeaturesAdvanced(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const doc = await features.query;
    const newDoc = groupByFuc(doc);

    const pagi = {
      current: req.query.current * 1 || 1,
      pageSize: req.query.pageSize * 1 || 10,
      total: newDoc.length,
    };

    res.status(200).json({
      status: "success",
      ...pagi,
      data: newDoc,
      // data: doc,
    });
  });
