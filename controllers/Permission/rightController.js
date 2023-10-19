const Right = require("../../models/Permission/rightModel");
const factory = require("../handlerFactory");

exports.getAllRights = factory.getAll(Right);
exports.getRight = factory.getOne(Right, "right");
exports.createRight = factory.createOne(Right);
exports.updateRight = factory.updateOne(Right, "right");
exports.deleteRight = factory.deleteOne(Right, "right");
