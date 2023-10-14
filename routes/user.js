import express from "express";
import {
  login,
  signup,
  getMyProfile,
  logout,
  updatePassword,
  updateProfile,
  updateProfilePhoto,
  forgotPassword,
  resetPassword,
  getAllUsers,
} from "../controllers/user.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import { singleFileUpload } from "../middlewares/multer.js";
import {
  addToCart,
  decreaseQuantityInCart,
  increaseQuantityInCart,
} from "../controllers/product.js";

const router = express.Router();

// User authentication and profile
router.post("/login", login);
router.post("/signup", singleFileUpload, signup);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getMyProfile);

// Updating user
router.put("/updateProfile", isAuthenticated, updateProfile);
router.put("/updatePassword", isAuthenticated, updatePassword);
router.put(
  "/updateAvatar",
  isAuthenticated,
  singleFileUpload,
  updateProfilePhoto
);
router.patch("/cart/:userId", isAuthenticated, addToCart);
router.patch(
  "/cart/increaseQuantity/:userId",
  isAuthenticated,
  increaseQuantityInCart
);
router.patch(
  "/cart/decreaseQuantity/:userId",
  isAuthenticated,
  decreaseQuantityInCart
);

// Resetting password
router.route("/forgotPassword").post(forgotPassword).put(resetPassword);

// Get all users
router.route("/all", isAdmin, getAllUsers);

export default router;
