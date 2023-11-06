const express = require("express");
const bigTicketController = require("../controllers/bigTicketController");
const authController = require("../controllers/authController");
const groupTicketRouter = require("../routes/groupTicketRouter");
const { permission } = authController;

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router.use("/:bigTicket/groupTickets", groupTicketRouter);

router
  .route("/")
  .get(
    // permission("Get All BigTickets"),
    bigTicketController.getAllBigTickets
  )
  .post(
    // permission("Create BigTicket"),
    bigTicketController.createBigTicket
  );

router
  .route("/all")
  .post(bigTicketController.deleteMany);

router
  .route("/:id")
  .get(
    // permission("Get BigTicket"),
    bigTicketController.getBigTicket
  )
  .patch(
    // permission("Update BigTicket"),
    bigTicketController.updateBigTicket
  )
  .delete(
    // permission("Delete BigTicket"),
    bigTicketController.deleteBigTicket
  );

// child route

module.exports = router;
