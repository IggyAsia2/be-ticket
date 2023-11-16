const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteParentAndChildren = (ModelParent, ModalChild, name) =>
  catchAsync(async (req, res, next) => {
    const parent = await ModelParent.findByIdAndDelete(req.params.id);

    if (parent) {
      await ModalChild.deleteMany({ [name]: req.params.id });
    } else {
      return next(new AppError(`No ${name} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: null,
    });
  });

exports.deleteOne = (Model, name) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No ${name} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: null,
    });
  });

exports.deleteMany = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = req.body.key;
    if (data.length) {
      for (let id of data) {
        await Model.findByIdAndDelete(id);
      }
    }

    res.status(200).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model, name) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`No ${name} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
 
exports.updateOneArray = (Model, name, ojay, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      // { $addToSet: { [ojay]: req.body[ojay] } },
      {
        new: true,
        runValidators: true,
      }
    );
    if (popOptions) query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError(`No ${name} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model, name, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError(`No ${name} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model, popOptions, virtualId) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET arrivals on diary

    let filter = {};
    if (req.params[virtualId]) filter = { [virtualId]: req.params[virtualId] };
    if (req.query.name) filter = { name: new RegExp(req.query.name, "i") };
    // Execute Query

    let query = Model.find(filter);
    const total = await Model.countDocuments();

    if (popOptions) query.populate(popOptions);

    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const doc = await features.query;

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
