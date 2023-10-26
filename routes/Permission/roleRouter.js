const express = require("express");
const roleController = require("../../controllers/Permission/roleController");
const authController = require("../../controllers/authController");

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(roleController.getAllRoles)
  .post(roleController.createRole);

router.route("/roleList").get(roleController.getRoleList);

router
  .route("/:id")
  .get(roleController.getRole)
  .patch(roleController.updateRole)
  .delete(roleController.deleteRole);

module.exports = router;
