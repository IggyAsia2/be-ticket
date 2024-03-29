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

exports.getSubUser = catchAsync(async (req, res, next) => {
  // query.populate({
  //   path: "subUser",
  // });
  const doc = await User.findById(req.user.id, "subUser");

  res.status(200).json({
    status: "success",
    data: doc.subUser,
  });
});

exports.insertSubUser = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  if (req.body.name === "Admin") {
    res.status(400).json({
      message: "Xin mời đặt tên khác!",
    });
  } else {
    const insertDocument = {
      $push: { subUser: { ...req.body } },
    };

    await User.findByIdAndUpdate(id, insertDocument);
    res.status(200).json({
      status: "success",
      data: null,
    });
  }
});

exports.deleteSubUser = catchAsync(async (req, res, next) => {
  const { subID } = req.params;
  const deleteDocument = {
    $pull: { subUser: { _id: subID } },
  };

  await User.findByIdAndUpdate(req.user.id, deleteDocument);
  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.updateSubUser = catchAsync(async (req, res, next) => {
  const { subID } = req.params;
  const { pin, name } = req.body;
  if (name === "Admin") {
    res.status(400).json({
      message: "Xin mời đặt tên khác!",
    });
  } else {
    let obj = {};
    if (name) obj["subUser.$[i].name"] = name;
    if (pin) obj["subUser.$[i].pin"] = pin;
    // console.log(obj);
    const updateDocument = {
      $set: { ...obj },
    };

    const options = {
      arrayFilters: [
        {
          "i._id": subID,
        },
      ],
    };
    await User.findByIdAndUpdate(req.user.id, updateDocument, options);
    res.status(200).json({
      status: "success",
      data: null,
    });
  }
});

exports.checkPinSubUser = catchAsync(async (req, res, next) => {
  const { pin, subID } = req.body;
  const doc = await User.findById(req.user.id, "subUser");
  const result = await doc.subUser.find(({ _id }) => _id.toString() === subID);

  if (result.pin === pin) {
    res.status(200).json({
      status: "success",
      data: result.name,
    });
  } else {
    res.status(400).json({
      message: "Mã pin không đúng, vui lòng nhập lại",
    });
  }
});

exports.updateDiscount = catchAsync(async (req, res, next) => {
  const { userID, bigID, list } = req.body;
  const user = await User.findById(userID);
  const findUser = user.discountList.find((el) => el.bigID === bigID);
  if (findUser) {
    let obj = {};
    if (list) obj["discountList.$[i].list"] = list;
    const updateDocument = {
      $set: { ...obj },
    };

    const options = {
      arrayFilters: [
        {
          "i._id": findUser._id,
        },
      ],
    };
    await User.findByIdAndUpdate(userID, updateDocument, options);
  } else {
    const insertDocument = {
      $push: { discountList: { bigID, list } },
    };
    await User.findByIdAndUpdate(userID, insertDocument);
  }
  res.status(200).json({
    status: "success",
  });
});
