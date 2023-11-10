const catchAsync = require("../utils/catchAsync");
const GroupTicket = require("../models/groupTicketModel");
const APIFeaturesAdvanced = require("../utils/apiFeaturesAdvanced");

exports.getAll = (Model, popOptions, virtualId) =>
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

    const pagi = {
      current: req.query.current * 1 || 1,
      pageSize: req.query.pageSize * 1 || 10,
      total: doc.length,
    };

    res.status(200).json({
      status: "success",
      ...pagi,
      data: doc,
    });
  });
