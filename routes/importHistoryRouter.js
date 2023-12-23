const express = require("express");
const importHistoryController = require("../controllers/importHistoryController");
const authController = require("../controllers/authController");

const router = express.Router();


router.use(authController.protect);

router.route("/").get(importHistoryController.getAllImportHistories);

module.exports = router;
