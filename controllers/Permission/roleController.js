const Role = require("../../models/Permission/roleModel");
const factory = require("../handlerFactory");

exports.getAllRoles = factory.getAll(Role);
exports.getRole = factory.getOne(Role, "role", {
  path: "rights",
  select: "-__v",
});
exports.createRole = factory.createOne(Role);
exports.updateRole = factory.updateOne(Role, "role");
exports.deleteRole = factory.deleteOne(Role, "role");
