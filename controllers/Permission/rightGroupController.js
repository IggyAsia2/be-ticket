const RightGroup = require("../../models/Permission/rightGroupModel");
const factory = require("../handlerFactory");

exports.getAllRightGroup = factory.getAll(RightGroup);
exports.getRighGroup = factory.getOne(RightGroup, "right group", { path: "rights" });
exports.createRightGroup = factory.createOne(RightGroup);
exports.updateRightGroup = factory.updateOne(RightGroup, "right group");
exports.deleteRightGroup = factory.deleteOne(RightGroup, "right group");
