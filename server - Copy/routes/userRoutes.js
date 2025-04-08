import express from "express";
import { changePassword, deleteProfile, forgotPassword, getProfile, login, logout, resetPassword, signup, updateProfile, createAdmin } from "../controllers/userController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.get("/logout", logout)
router.get("/myprofile", isLoggedIn, getProfile)
router.post("/forgot-password", forgotPassword)
router.post("/reset/:resetToken", resetPassword)
router.put("/change-password", isLoggedIn, changePassword)
router.put("/update", isLoggedIn, upload.single("avatar"), updateProfile)
router.delete("/delete-profile", isLoggedIn, deleteProfile)
router.post("/create-admin", createAdmin)


export default router