const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { permission } = authController;

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);

router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

router.get("/role/:id", userController.getRoleByUser);

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router
  .route("/role")
  .get(permission("Get User"), userController.getAllUserByRole);

router
  .route("/")
  .get(permission("Get User"), userController.getAllUsers)
  .post(permission("Create User"), userController.createUser);

router
  .route("/all")
  .post(permission("Delete User"), userController.deleteManyUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(permission("Update User"), userController.updateUser)
  .delete(permission("Delete User"), userController.deleteUser);

module.exports = router;
