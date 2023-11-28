const express = require("express");
const departController = require("../controllers/departController");
const authController = require("../controllers/authController");

const router = express.Router();


router.use(authController.protect);

router.route("/").get(departController.getAllDeparts);

router.use(authController.restrictTo("admin"));

router.route("/").post(departController.createDepart);

router
  .route("/:id")
  .post(departController.insertCashier)
  .get(departController.getDepart)
  .patch(departController.updateDepart)
  .delete(departController.deleteDepart);

router.route("/:id/:cashID").patch(departController.updateCashier);
router.route("/:id/:cashID").delete(departController.deleteCashier);

module.exports = router;
