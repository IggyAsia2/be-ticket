const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");
const { permission } = authController;

const router = express.Router({ mergeParams: true });

router.route("/link-order/:id").get(orderController.getLinkOrder);

// Protect all routes after this middleware
router.use(authController.protect);
// router.use(authController.restrictTo("admin"));
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

router.route("/reduce").post(orderController.reduceOrder);

router.route("/thor").patch(orderController.updateThor);

router.route("/report").get(orderController.getAllReport);

router.route("/agent-report").get(orderController.getAllAgentReport);

router.route("/all").post(orderController.updateManyOrder);

router.route("/send-mail").post(orderController.sendEmailOrder);

router.route("/cancel-many").post(orderController.cancelManyOrder);

router.route("/cancel/:id").post(orderController.cancelOrder);

router.route("/driver").get(orderController.statisticDriver);

router.route("/price/:id").patch(orderController.updatePriceOrder);

router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(orderController.updateOrder);

router.route("/agent/:id").patch(orderController.updateAgentOrder);

// router.route("/agent/all").post(orderController.updateAgentManyOrder);

module.exports = router;
