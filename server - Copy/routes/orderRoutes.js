import express from "express";
import { isLoggedIn, authorizedRole } from "../middleware/authMiddleware.js";
import { createOrder, getUserOrders, getSellerOrders, updateOrderStatus, trackOrder, getOrderDetails } from "../controllers/orderController.js";

const router = express.Router();

// Route to create a new order
// POST /api/v1/orders/new
router.post(
    "/new",
    isLoggedIn,
    createOrder
);

// Route to get all orders for a buyer
// GET /api/v1/orders/buyer
router.get(
    "/buyer",
    isLoggedIn,
    getUserOrders
);

// Route to get all orders for a seller
// GET /api/v1/orders/seller
router.get(
    "/seller",
    isLoggedIn,
    authorizedRole("SELLER"),
    getSellerOrders
);

// Route to update order status (restricted to SELLER and ADMIN)
// PUT /api/v1/orders/:id/status
router.put(
    "/:id/status",
    isLoggedIn,
    authorizedRole("SELLER", "ADMIN"),
    updateOrderStatus
);

// Route for tracking an order
// GET /api/v1/orders/:id/track
router.get(
    "/:id/track",
    isLoggedIn,  // Changed from verifyToken to isLoggedIn
    trackOrder
);

// Route to get detailed order information
// GET /api/v1/orders/:id
router.get(
    "/product/:id",
    isLoggedIn,
    getOrderDetails
);


export default router; 