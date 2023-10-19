const express = require("express");
const rightGroupController = require("../../controllers/Permission/rightGroupController");
const authController = require("../../controllers/authController");

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(rightGroupController.getAllRightGroup)
  .post(rightGroupController.createRightGroup);

router
  .route("/:id")
  .get(rightGroupController.getRighGroup)
  .patch(rightGroupController.updateRightGroup)
  .delete(rightGroupController.deleteRightGroup);

module.exports = router;
