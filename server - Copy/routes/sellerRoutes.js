import express from 'express';
import { isLoggedIn, authorizedRole } from "../middleware/authMiddleware.js";
import {
    // updateStoreDetails,
    getSellerDashboardStats

} from '../controllers/sellerController.js';
import { calculateOrderEarnings, getSellerEarnings, processWithdrawal } from '../controllers/paymentController.js';
import { createError } from '../utils/createError.js';

const router = express.Router();

// Dashboard route
router.get('/dashboard/stats', isLoggedIn, authorizedRole('SELLER'), getSellerDashboardStats);

// Earnings routes
router.get('/earnings', isLoggedIn, authorizedRole('SELLER'), getSellerEarnings);
router.post('/withdraw', isLoggedIn, authorizedRole('SELLER'), processWithdrawal);

// Calculate earnings for specific order
router.post('/order/:orderId/calculate-earnings', isLoggedIn, authorizedRole('SELLER'), calculateOrderEarnings);

// Store management routes
// router.get('/store', isLoggedIn, authorizedRole('SELLER'), getStoreDetails);
// router.put('/store/update', isLoggedIn, authorizedRole('SELLER'), updateStoreDetails);

export default router; 