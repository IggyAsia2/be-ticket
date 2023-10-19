const express = require("express");
const rightController = require("../../controllers/Permission/rightController");
const authController = require("../../controllers/authController");

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(rightController.getAllRights)
  .post(rightController.createRight);

router
  .route("/:id")
  .get(rightController.getRight)
  .patch(rightController.updateRight)
  .delete(rightController.deleteRight);

module.exports = router;
