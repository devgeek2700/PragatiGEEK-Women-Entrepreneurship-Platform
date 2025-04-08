import express from "express";
import { isLoggedIn, authorizedRole } from "../middleware/authMiddleware.js";
import { getAdminDashboardStats } from "../controllers/adminController.js";

const router = express.Router();

// Get Admin Dashboard Statistics
router.get("/dashboard", isLoggedIn, authorizedRole("ADMIN"), getAdminDashboardStats);

export default router; 