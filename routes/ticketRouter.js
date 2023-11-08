const express = require("express");
const ticketController = require("../controllers/ticketController");
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
    ticketController.getAllTickets
  )
  .post(
    // permission("Create Ticket"),
    ticketController.createTicket
  );

router.route("/all").post(ticketController.deleteMany);

router.route("/num-ticketByDay").get(ticketController.getNumberTicketByDay);

router.route("/import").post(ticketController.importTicket);

router
  .route("/:id")
  .get(
    // permission("Get Ticket"),
    ticketController.setGroupTicketUserIds,
    ticketController.getTicket
  )
  .patch(
    // permission("Update Ticket"),
    ticketController.updateTicket
  )
  .delete(
    // permission("Delete Ticket"),
    ticketController.deleteTicket
  );

module.exports = router;
