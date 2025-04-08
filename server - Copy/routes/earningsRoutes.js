import { Router } from 'express';  // Use Router instead of express.Router() for consistency
import { isLoggedIn, authorizedRole } from "../middleware/authMiddleware.js";
import { getEarnings, requestWithdrawal, getEarningsHistory } from "../controllers/earningsController.js";

const router = Router();

// Get seller's earnings
router.get("/", isLoggedIn, authorizedRole("SELLER"), getEarnings);

// Request withdrawal
router.post("/withdraw", isLoggedIn, authorizedRole("SELLER"), requestWithdrawal);

// Get earnings history
router.get("/history", isLoggedIn, authorizedRole("SELLER"), getEarningsHistory);

export default router; 