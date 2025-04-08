import { Router } from 'express'
import {
    allPayments,
    createSubscription,
    cancelSubscription,
    getStripePublishableKey,
    verifySubscription,
    createPaymentIntent,
    verifyPayment,
    checkout,
    productCheckout,
    createCoursePaymentIntent,
    verifyCoursePayment,
    getSellerOrders,
    updateOrderStatus,
    cancelOrder,
    calculateOrderEarnings,
    getSellerEarnings,
    processWithdrawal
} from '../controllers/paymentController.js'
import { authorizedRole, isLoggedIn } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', isLoggedIn, authorizedRole('ADMIN'), allPayments)

router.get('/stripe-key', getStripePublishableKey)

router.post('/subscribe', isLoggedIn, createSubscription)

router.post('/verify-subscription', isLoggedIn, verifySubscription)

router.post('/cancel-subscription', isLoggedIn, cancelSubscription)

router.post("/create-payment-intent", isLoggedIn, createPaymentIntent)

router.post("/verify-payment", isLoggedIn, verifyPayment)

router.post('/checkout', isLoggedIn, checkout)

router.post('/product/checkout', isLoggedIn, productCheckout)

router.post("/course/create-payment-intent", isLoggedIn, createCoursePaymentIntent)

router.post("/course/verify-payment", isLoggedIn, verifyCoursePayment)

router.get("/seller-orders", isLoggedIn, authorizedRole("SELLER"), getSellerOrders)

router.put("/order/:orderId/status", isLoggedIn, authorizedRole("SELLER"), updateOrderStatus)

router.put("/order/:orderId/cancel", isLoggedIn, authorizedRole("SELLER"), cancelOrder)

// Calculate earnings for a specific order
router.post("/order/:orderId/calculate-earnings", isLoggedIn, authorizedRole("SELLER"), calculateOrderEarnings)

// Seller earnings routes
router.get("/seller/earnings", isLoggedIn, authorizedRole("SELLER"), getSellerEarnings)
router.post("/seller/withdraw", isLoggedIn, authorizedRole("SELLER"), processWithdrawal)

export default router