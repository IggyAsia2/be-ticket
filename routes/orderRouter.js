const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");
const { permission } = authController;

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo("admin"));
// router.use();

router
  .route("/")
  .get(
    // permission("Get Ticket"),
    orderController.getAllOrders
  )
  .post(
    // permission("Create Ticket"),
    orderController.createOrder
  );

router.route("/all").post(orderController.deleteMany);

router.route("/cancel/:id").post(orderController.cancelOrder);

router
  .route("/:id")
  .get(
    // permission("Get Ticket"),
    orderController.getOrder
  )
  .patch(
    // permission("Update Ticket"),
    orderController.updateOrder
  )
  .delete(
    // permission("Delete Ticket"),
    orderController.deleteOrder
  );

module.exports = router;
