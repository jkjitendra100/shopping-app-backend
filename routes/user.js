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
} from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleFileUpload } from "../middlewares/multer.js";

const router = express.Router();

// User authentication and profile
router.post("/login", login);
router.post("/signup", singleFileUpload, signup);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getMyProfile);

// Updating user
router.put("/updateProfile", isAuthenticated, updateProfile);
router.put("/updatePassword", isAuthenticated, updatePassword);
router.put("/updateAvatar", isAuthenticated, singleFileUpload, updateProfilePhoto);

// Resetting password
router.route("/forgotPassword").post(forgotPassword).put(resetPassword);

export default router;
