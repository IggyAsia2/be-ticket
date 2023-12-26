const groupTicketController = require("../controllers/groupTicketController");
const ticketRouter = require("../routes/ticketRouter");
const express = require("express");
const authController = require("../controllers/authController");
const { permission } = authController;

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
// router.use(authController.restrictTo("admin"));

router.use("/:groupTicket/tickets", ticketRouter);

router
  .route("/")
  .get(
    // permission("Get GroupTicket"),
    groupTicketController.getAllGroupTickets
  )
  .post(
    // permission("Create GroupTicket"),
    groupTicketController.setBigTicketUserIds,
    groupTicketController.createGroupTicket
  );

router
  .route("/all")
  .get(groupTicketController.getAllForImport)
  .post(groupTicketController.deleteMany);

router.route("/export").post(groupTicketController.exportTicket);

// router.route("/mock").post(groupTicketController.getMockData);

router.route("/export-group").post(groupTicketController.exportGroupTicket);

router.route("/export-agent-group").post(groupTicketController.exportAgentGroupTicket);

router.route("/stock/:id").get(groupTicketController.updateStock);

router.route("/mock").post(groupTicketController.getMockData);

router
  .route("/:id")
  .get(
    // permission("Get GroupTicket"),
    groupTicketController.getGroupTicket
  )
  .patch(
    // permission("Update GroupTicket"),
    groupTicketController.updateGroupTicket
  )
  .delete(
    // permission("Delete GroupTicket"),
    groupTicketController.deleteGroupTicket
  );
module.exports = router;
