const Role = require("../../models/Permission/roleModel");
const factory = require("../handlerFactory");
const catchAsync = require("../../utils/catchAsync");

exports.getAllRoles = factory.getAll(Role);
exports.getRole = factory.getOne(Role, "role", {
  path: "rights",
  select: "-__v",
});
exports.createRole = factory.createOne(Role);
exports.updateRole = factory.updateOneArray(Role, "role", "rights", {
  path: "rights",
  select: "-__v",
}); 
exports.deleteRole = factory.deleteOne(Role, "role");

exports.getRoleList = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.query.name) filter = { name: new RegExp(req.query.name, "i") };

  let doc = await Role.find(filter);

  const data = doc.map((el) => {
    return {
      value: el._id,
      label: el.name,
    };
  });

  res.status(200).json(data);
});
