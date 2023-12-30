const ImportHistory = require("../models/importHistoryModel");
const HistoryTopup = require("../models/historyTopupModel");
const factory = require("./handlerFactory");

exports.getAllImportHistories = factory.getAll(ImportHistory);

exports.getAllHistoriesTopup = factory.getAll(HistoryTopup);
