const express = require("express");
const sunController = require("../controllers/sunController");
const authController = require("../controllers/authController");
const { permission } = authController;

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);
// router.use(authController.restrictTo("admin"));
// router.use();

router.route("/").get(sunController.getAllSunSites);
router.route("/products").get(sunController.getSiteProducts);
router
  .route("/orders")
  .get(sunController.getOrderSun)
  .post(sunController.createOrderSun);

module.exports = router;
