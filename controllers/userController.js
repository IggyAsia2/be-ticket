const User = require("../models/userModel");
const Role = require("../models/Permission/roleModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POST password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password update. Please use /updateMyPassword"
      )
    );
  }

  // 2) Filtered out unwanted fields name that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "role");

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      uesr: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);

exports.getAllUserByRole = catchAsync(async (req, res, next) => {
  // console.log(req.query);
  const role = await Role.findOne({ name: req.query.name });

  const doc = await User.find({ role: role._id });
  res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.getRoleByUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  const doc = await Role.findById(user.role.id).populate({
    path: "rights",
    select: "-__v -id -_id -group -method",
  });
  const arr = doc.rights.map((el) => el.name);
  res.status(200).json({
    status: "success",
    data: arr,
  });
});

exports.getUser = factory.getOne(User, "user");

exports.createUser = catchAsync(async (req, res, next) => {
  const data = {
    password: "",
    passwordConfirm: "",
    ...req.body,
  };
  if (!req.body.password) {
    data.password = "123456";
    data.passwordConfirm = "123456";
  }
  // console.log(data);
  const doc = await User.create(data);
  res.status(201).json({
    status: "success",
    data: doc,
  });
});

exports.updateUser = factory.updateOne(User, "user");

exports.deleteUser = factory.deleteOne(User, "user");

exports.deleteManyUser = catchAsync(async (req, res, next) => {
  const data = req.body.key;
  if (data.length) {
    for (let id of data) {
      await User.findByIdAndDelete(id);
    }
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
