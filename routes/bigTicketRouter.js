const express = require("express");
const multer = require("multer");
const path = require("path");
const bigTicketController = require("../controllers/bigTicketController");
const authController = require("../controllers/authController");
const groupTicketRouter = require("../routes/groupTicketRouter");
const { permission } = authController;

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);
// router.use(authController.restrictTo("admin"));

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

router.route("/all").post(bigTicketController.deleteMany);

router
  .route("/:id")
  .get(
    // permission("Get BigTicket"),
    bigTicketController.getBigTicket
  )
  .patch(
    // permission("Update BigTicket"),
    bigTicketController.uploadImg,
    bigTicketController.updateBigTicket
  )
  .delete(
    // permission("Delete BigTicket"),
    bigTicketController.deleteBigTicket
  );

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     console.log("object");

//     cb(null, 'public/image/BigTicket');
//   },
//   filename: function (req, file, cb) {
//     console.log(file);
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + file.originalname
//     );
//   },
//   fileFilter: function (req, file, cb) {
//     console.log("object");

//     const ext = path.extname(file.originalname);
//     if (ext !== ".png" && ext !== ".jpg" && ext !== "jpeg") {
//       return cb(new Error("Only images are allowed"));
//     }
//     cb(null, true);
//   },
// });

// const upload = multer({
//   storage: storage,
// });

// const fileUpload = upload.fields([{ name: "logo", maxCount: 1 }]);

// router.route("/logo").post(fileUpload, (req, res) => {
//   res.json({ message: "asd" });
// });

// child route

module.exports = router;
