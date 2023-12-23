const ImportHistory = require("../models/importHistoryModel");
const factory = require("./handlerFactory");

exports.getAllImportHistories = factory.getAll(ImportHistory);
