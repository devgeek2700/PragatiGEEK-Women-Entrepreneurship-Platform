import { Payment } from '../models/paymentModel.js'
import User from '../models/userModel.js'
import { stripe } from '../server.js'
import { createError } from '../utils/createError.js'
import { Order } from "../models/orderModel.js";
import Course from '../models/courseModel.js'
import { Product } from '../models/productModel.js'
import mongoose from 'mongoose'

export const getStripePublishableKey = async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Stripe publishable key",
        key: process.env.STRIPE_PUBLISHABLE_KEY
    })
}

export const createSubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { courseId, paymentMethodId } = req.body;

        // Validate required fields
        if (!courseId || !paymentMethodId) {
            return next(createError(400, "Course ID and payment method are required"));
        }

        // Find user and validate
        const user = await User.findById(id);
        if (!user) return next(createError(404, "Please log in again"));
        if (user.role === 'ADMIN') return next(createError(400, "Admin cannot purchase a subscription"));
        if (user.subscription.status === 'active') return next(createError(400, "Already subscribed"));

        // Find course and validate
        const course = await Course.findById(courseId);
        if (!course) return next(createError(404, "Course not found"));
        if (!course.price || course.price <= 0) return next(createError(400, "Invalid course price"));

        // Create/update Stripe customer
        let customer;
        try {
            if (!user.stripeCustomerId) {
                customer = await stripe.customers.create({
                    email: user.email,
                    name: user.name,
                    payment_method: paymentMethodId,
                    invoice_settings: { default_payment_method: paymentMethodId },
                    metadata: { userId: user.id }
                });
                user.stripeCustomerId = customer.id;
                await user.save();
            } else {
                customer = await stripe.customers.retrieve(user.stripeCustomerId);
                // Update payment method if it exists
                await stripe.customers.update(customer.id, {
                    invoice_settings: { default_payment_method: paymentMethodId }
                });
            }
        } catch (stripeError) {
            return next(createError(400, "Error creating/updating customer: " + stripeError.message));
        }

        // Create dynamic price for course
        const price = await stripe.prices.create({
            unit_amount: Math.round(course.price * 100), // Ensure integer amount
            currency: 'inr',
            recurring: { interval: 'month' },
            product_data: {
                name: course.title,
                description: `Subscription for ${course.title}`,
                metadata: { courseId: course.id }
            },
        });

        // Create subscription with metadata
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: price.id }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                courseId,
                userId: user.id,
                courseName: course.title
            },
        });

        // Update user subscription details
        user.subscription = {
            id: subscription.id,
            status: subscription.status,
            courseId: courseId,
            startDate: new Date(),
            priceId: price.id
        };
        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscription created successfully",
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        });
    } catch (error) {
        return next(createError(500, "Subscription creation failed: " + error.message));
    }
};

export const verifySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { subscriptionId } = req.body;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (!subscription || subscription.status !== 'active') {
            return next(createError(400, "Subscription not active"));
        }

        const user = await User.findById(id);
        if (!user) return next(createError(404, "User not found"));

        user.subscription = {
            id: subscription.id,
            status: subscription.status,
        };
        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscription verified successfully",
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
}

export const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.user
        const user = await User.findById(id)

        if (!user) {
            return next(createError(400, "Please log in again"))
        }

        if (user.role === 'ADMIN') {
            return next(createError(400, "You are not allowed to do this"))
        }

        if (!user.subscription.id) {
            return next(createError(400, "No active subscription found"))
        }

        // In developer mode, we'll just simulate cancelling the subscription
        user.subscription.status = 'cancelled';
        user.subscription.id = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscription canceled successfully"
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const allPayments = async (req, res, next) => {
    try {
        // In developer mode, we'll return simulated data
        const simulatedPayments = Array(10).fill().map((_, i) => ({
            id: 'pm_' + Date.now() + i,
            amount: 4990,
            status: 'succeeded',
            created: Date.now() / 1000 - i * 86400 // Simulating payments over the last 10 days
        }));

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]

        const finalMonths = monthNames.reduce((acc, month) => ({ ...acc, [month]: 0 }), {})

        const monthlyWisePayments = simulatedPayments.map(payment => {
            const date = new Date(payment.created * 1000)
            return monthNames[date.getMonth()]
        })

        monthlyWisePayments.forEach(month => {
            finalMonths[month] += 1
        })

        const monthlySalesRecord = Object.values(finalMonths)

        res.status(200).json({
            success: true,
            message: 'All payments',
            allPayments: simulatedPayments,
            finalMonths,
            monthlySalesRecord,
        })
    } catch (error) {
        return next(createError(500, error.message))
    }
}

export const createPaymentIntent = async (req, res, next) => {
    try {
        const { productId, quantity, amount, shippingAddress, paymentMethod } = req.body;

        // Debug logging
        console.log('Request body:', req.body);

        if (!productId || !amount || !shippingAddress || !shippingAddress?.name) {
            console.log('Missing fields:', {
                hasProductId: !!productId,
                hasAmount: !!amount,
                hasShippingAddress: !!shippingAddress,
                hasShippingName: !!shippingAddress?.name
            });
            return next(createError(400, "Missing required fields including shipping name"));
        }

        // Find product and validate
        const product = await Product.findById(productId);
        if (!product) {
            return next(createError(404, "Product not found"));
        }

        // Create order first
        const order = await Order.create({
            buyer: req.user.id,
            products: [{
                product: productId,
                quantity: quantity || 1,
                price: product.price,
                seller: product.seller
            }],
            totalAmount: amount,
            shippingAddress,
            status: 'Pending',
            paymentStatus: 'Pending',
            paymentMethod: paymentMethod,
            type: 'product'
        });

        // Create payment intent with customer billing details
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: 'inr',
            description: `Payment for ${product.name} - Order #${order._id}`,
            metadata: {
                orderId: order._id.toString(),
                productId,
                userId: req.user.id,
                productName: product.name
            },
            shipping: {
                name: shippingAddress.name.trim(), // Ensure name is properly formatted
                address: {
                    line1: shippingAddress.street,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postal_code: shippingAddress.pinCode,
                    country: 'IN' // India
                }
            }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            orderId: order._id
        });

    } catch (error) {
        return next(createError(500, error.message));
    }
};

export const verifyPayment = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return next(createError(400, "Payment Intent ID is required"));
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            const orderId = paymentIntent.metadata.orderId;
            const order = await Order.findById(orderId);

            if (!order) {
                return next(createError(404, "Order not found"));
            }

            // Update order status
            order.paymentStatus = 'Paid';
            order.status = 'Processing';
            order.paymentIntentId = paymentIntentId;

            // Calculate and update seller earnings
            const updatePromises = order.products.map(async (item) => {
                // Calculate earnings (80% to seller, 20% platform fee)
                const price = Number(item.price) || 0;
                const earnings = Math.round((price * 0.8) * 100) / 100;

                // Set earnings in the order product
                item.earnings = earnings;

                // Update seller's earnings and earnings history
                return User.findByIdAndUpdate(
                    item.seller,
                    {
                        $inc: { earnings: earnings },
                        $push: {
                            earningsHistory: {
                                amount: earnings,
                                orderId: order._id,
                                productId: item.product,
                                type: 'sale',
                                description: `Earnings from order #${order._id}`,
                                timestamp: new Date()
                            }
                        }
                    },
                    { new: true }
                );
            });

            // Save the order and update sellers
            await order.save();
            await Promise.all(updatePromises);

            // Create payment record with paymentIntentId
            await Payment.create({
                payment_id: paymentIntentId,
                payment_type: 'payment_intent',
                customer_id: paymentIntent.customer || 'guest',
                order_id: orderId,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                description: paymentIntent.description || 'Product purchase',
                paymentIntentId: paymentIntentId
            });

            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                order: order
            });
        } else {
            return next(createError(400, `Payment status is ${paymentIntent.status}`));
        }
    } catch (error) {
        if (error.type === 'StripeError') {
            return next(createError(400, error.message));
        }
        return next(createError(500, error.message));
    }
};

export const checkout = async (req, res) => {
    try {
        const { name, price } = req.body;

        // Find the course
        const course = await Course.findOne({ title: name });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Use the price passed from frontend, fallback to course price
        const finalPrice = price || course.price;

        // Validate price
        if (!finalPrice || isNaN(finalPrice)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course price'
            });
        }

        // Convert price to cents and ensure it's a valid integer
        const amount = Math.round(finalPrice * 100);

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'inr',
            metadata: {
                courseId: course._id.toString(),
                userId: req.user.id
            }
        });

        res.status(200).json({
            success: true,
            course,
            clientSecret: paymentIntent.client_secret
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

export const productCheckout = async (req, res, next) => {
    try {
        const { id, price } = req.body;
        const product = await Product.findById(id);

        if (!product) {
            return next(createError(404, "Product not found"));
        }

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price * 100, // Convert to cents
            currency: 'inr',
            metadata: {
                productId: product._id.toString(),
                userId: req.user.id,
                type: 'PRODUCT'
            }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            product
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

export const createCoursePaymentIntent = async (req, res, next) => {
    try {
        const { courseId, amount } = req.body;
        console.log("Creating course payment intent:", { courseId, amount, userId: req.user.id });

        // Validate required fields
        if (!courseId || !amount) {
            return next(createError(400, "Course ID and amount are required"));
        }

        // Find course and validate
        const course = await Course.findById(courseId);
        if (!course) {
            return next(createError(404, "Course not found"));
        }

        // Validate user
        const user = await User.findById(req.user.id);
        if (!user) return next(createError(404, "Please log in again"));
        if (user.role === 'ADMIN') return next(createError(400, "Admin cannot purchase courses"));

        // Check if user already has access to this course
        const hasAccess = user.subscriptions && user.subscriptions.some(sub =>
            sub.courseId.toString() === courseId && sub.status === 'active'
        );
        if (hasAccess) {
            return next(createError(400, "You already have access to this course"));
        }

        // Default address for digital products
        const defaultAddress = {
            line1: 'Digital Product - No Physical Address',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            country: 'IN'
        };

        // Create/update Stripe customer if needed
        let customer;
        try {
            if (!user.stripeCustomerId) {
                customer = await stripe.customers.create({
                    email: user.email,
                    name: user.name,
                    address: defaultAddress,
                    metadata: {
                        userId: user.id.toString() // Ensure userId is stored as string
                    }
                });
                user.stripeCustomerId = customer.id;
                await user.save();
            } else {
                customer = await stripe.customers.retrieve(user.stripeCustomerId);
                // Update customer with address if not present
                if (!customer.address) {
                    await stripe.customers.update(customer.id, {
                        address: defaultAddress,
                        metadata: {
                            userId: user.id.toString() // Ensure userId is stored as string
                        }
                    });
                }
            }
        } catch (stripeError) {
            console.error("Stripe customer error:", stripeError);
            return next(createError(400, "Error creating/updating customer: " + stripeError.message));
        }

        // Create payment intent for digital product
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'inr',
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'always'
            },
            metadata: {
                courseId: course._id.toString(), // Ensure courseId is stored as string
                userId: user.id.toString(), // Ensure userId is stored as string
                type: 'course',
                courseName: course.title,
                isDigitalProduct: 'true'
            },
            description: `Course subscription for ${course.title}`,
            shipping: {
                name: user.name,
                address: defaultAddress
            }
        });

        console.log("Created payment intent:", {
            id: paymentIntent.id,
            metadata: paymentIntent.metadata
        });

        // Create initial payment record
        const payment = await Payment.create({
            payment_id: paymentIntent.id,
            payment_type: 'payment_intent',
            payment_method: 'Card',
            customer_id: customer.id,
            course_id: courseId,
            user: user.id, // Use the actual user ID here
            order_type: 'course',
            status: 'pending',
            amount: amount,
            currency: 'inr',
            description: `Course subscription for ${course.title}`,
            metadata: {
                courseId: course._id.toString(),
                userId: user.id.toString(),
                courseName: course.title,
                paymentIntentStatus: paymentIntent.status
            }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            paymentStatus: paymentIntent.status,
            paymentRecord: payment._id,
            customer: customer.id
        });

    } catch (error) {
        console.error("Error creating course payment intent:", error);
        return next(createError(500, error.message));
    }
};

export const verifyCoursePayment = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.body;
        console.log("Verifying course payment for paymentIntentId:", paymentIntentId);

        if (!paymentIntentId) {
            return next(createError(400, "Payment Intent ID is required"));
        }

        // Check if payment is already processed
        const existingPayment = await Payment.findOne({
            payment_id: paymentIntentId,
            status: { $in: ['successful', 'succeeded'] }
        });

        if (existingPayment) {
            console.log("Payment already processed:", existingPayment);
            return res.status(200).json({
                success: true,
                message: "Payment was already processed successfully",
                subscription: existingPayment.metadata.get('subscriptionData')
            });
        }

        // Retrieve payment intent with expanded customer details
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
            expand: ['customer']
        });
        console.log("Payment Intent retrieved:", {
            status: paymentIntent.status,
            metadata: paymentIntent.metadata,
            customer: paymentIntent.customer ? {
                id: paymentIntent.customer.id,
                metadata: paymentIntent.customer.metadata
            } : null
        });

        // Handle different payment intent statuses
        switch (paymentIntent.status) {
            case 'succeeded':
                try {
                    const courseId = paymentIntent.metadata.courseId;
                    let userId = paymentIntent.metadata.userId;

                    // If userId is not in metadata, try to get it from customer metadata
                    if (!userId && paymentIntent.customer && paymentIntent.customer.metadata) {
                        userId = paymentIntent.customer.metadata.userId;
                    }

                    // If still no userId, try to find user by customer ID
                    if (!userId && paymentIntent.customer) {
                        const userByCustomerId = await User.findOne({ stripeCustomerId: paymentIntent.customer.id });
                        if (userByCustomerId) {
                            userId = userByCustomerId._id.toString();
                        }
                    }

                    // If still no valid userId, check if it's in the request user
                    if (!userId && req.user && req.user.id) {
                        userId = req.user.id;
                    }

                    if (!userId) {
                        console.error("Could not determine user ID from payment intent or request");
                        return next(createError(400, "Could not determine user ID"));
                    }

                    // Validate that userId is a valid ObjectId
                    if (!mongoose.Types.ObjectId.isValid(userId)) {
                        console.error("Invalid user ID format:", userId);
                        return next(createError(400, "Invalid user ID format"));
                    }

                    const amount = paymentIntent.amount / 100; // Convert from cents

                    if (!courseId) {
                        console.error("Missing courseId in metadata");
                        return next(createError(400, "Invalid payment metadata: missing courseId"));
                    }

                    console.log("Processing successful payment:", {
                        courseId,
                        userId,
                        amount
                    });

                    // Find the course
                    const course = await Course.findById(courseId);
                    if (!course) {
                        console.error("Course not found:", courseId);
                        return next(createError(404, "Course not found"));
                    }

                    // Calculate instructor earnings (80%)
                    const earnings = Math.round((amount * 0.8) * 100) / 100;

                    // Update instructor's earnings and history
                    await User.findByIdAndUpdate(
                        course.createdBy,
                        {
                            $inc: { earnings: earnings },
                            $push: {
                                earningsHistory: {
                                    amount: earnings,
                                    courseId: courseId,
                                    type: 'course_sale',
                                    description: `Earnings from course: ${course.title}`,
                                    timestamp: new Date()
                                }
                            }
                        }
                    );

                    // Update user subscription status
                    const user = await User.findById(userId);
                    if (!user) {
                        console.error("User not found:", userId);
                        return next(createError(404, "User not found"));
                    }

                    // Update user's subscription details
                    const subscriptionData = {
                        id: paymentIntentId,
                        status: 'active',
                        courseId: courseId,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                    };

                    console.log("Updating user subscription:", {
                        userId,
                        subscriptionData
                    });

                    // Initialize subscriptions array if it doesn't exist
                    if (!user.subscriptions) {
                        user.subscriptions = [];
                    }

                    // Add new subscription
                    user.subscriptions.push(subscriptionData);
                    await user.save();

                    // Update or create payment record
                    const paymentData = {
                        payment_id: paymentIntentId,
                        payment_type: 'payment_intent',
                        order_type: 'course',
                        customer_id: paymentIntent.customer.id,
                        user: userId,
                        course_id: courseId,
                        status: paymentIntent.status,
                        amount: amount,
                        currency: paymentIntent.currency,
                        description: paymentIntent.description,
                        payment_method: 'Card',
                        metadata: new Map(Object.entries({
                            ...paymentIntent.metadata,
                            subscriptionStatus: 'active',
                            subscriptionData: JSON.stringify(subscriptionData)
                        }))
                    };

                    const updatedPayment = await Payment.findOneAndUpdate(
                        { payment_id: paymentIntentId },
                        paymentData,
                        {
                            new: true,
                            upsert: true,
                            runValidators: true,
                            setDefaultsOnInsert: true
                        }
                    );

                    console.log("Payment record updated:", updatedPayment);

                    return res.status(200).json({
                        success: true,
                        message: "Course payment verified successfully",
                        subscription: subscriptionData
                    });
                } catch (error) {
                    console.error("Error processing successful payment:", error);
                    return next(createError(500, `Error processing payment: ${error.message}`));
                }

            case 'requires_payment_method':
                return res.status(200).json({
                    success: false,
                    message: "Payment method required",
                    status: paymentIntent.status
                });

            case 'processing':
                return res.status(200).json({
                    success: false,
                    message: "Payment is still processing",
                    status: paymentIntent.status
                });

            default:
                return res.status(200).json({
                    success: false,
                    message: `Payment status is ${paymentIntent.status}`,
                    status: paymentIntent.status
                });
        }
    } catch (error) {
        console.error("Error in verifyCoursePayment:", error);
        if (error.type === 'StripeError') {
            return next(createError(400, `Stripe error: ${error.message}`));
        }
        return next(createError(500, `Server error: ${error.message}`));
    }
};

export const getSellerOrders = async (req, res, next) => {
    try {
        const sellerId = req.user.id;

        // First find orders where the seller is involved and payment is completed
        const orders = await Order.find({
            'products.seller': sellerId,
            paymentStatus: 'Paid'  // Only get paid orders
        }).populate({
            path: 'products.product',
            select: 'name price images'
        }).populate({
            path: 'buyer',
            select: 'name email'
        });

        if (!orders.length) {
            return res.status(200).json({
                success: true,
                message: "No paid orders found for this seller",
                count: 0,
                orders: []
            });
        }

        // Return the orders directly since we have all the information we need
        res.status(200).json({
            success: true,
            count: orders.length,
            orders: orders.map(order => ({
                orderId: order._id,
                buyer: order.buyer,
                products: order.products,
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                shippingAddress: order.shippingAddress,
                createdAt: order.createdAt
            }))
        });

    } catch (error) {
        console.error("Error in getSellerOrders:", error);
        return next(createError(500, error.message));
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        console.log("Updating order:", orderId, "to status:", status);

        // Validate status
        const validStatuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return next(createError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`));
        }

        const orderToUpdate = await Order.findById(orderId);

        if (!orderToUpdate) {
            return next(createError(404, 'Order not found'));
        }

        // Verify seller owns this product
        const isSellerProduct = orderToUpdate.products.some(item =>
            item.seller && item.seller.toString() === req.user.id
        );

        if (!isSellerProduct) {
            return next(createError(403, 'Not authorized to update this order'));
        }

        // Update order status
        orderToUpdate.status = status;
        await orderToUpdate.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order: orderToUpdate
        });

    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            orderId,
            'products.seller': req.user._id
        });

        if (!order) {
            return next(createError(404, 'Order not found'));
        }

        order.status = 'Cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });

    } catch (error) {
        next(error);
    }
};

const canUpdateOrder = (order) => {
    console.log("Order status:", order?.status);
    // Only allow updates for Pending and Processing orders
    return order?.status === 'Processing' || order?.status === 'Pending';
};

// Calculate earnings for an order
export const calculateOrderEarnings = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        console.log("Calculating earnings for order:", orderId);

        // Try to find order by either _id or orderId
        const order = await Order.findOne({
            $or: [
                { _id: orderId },
                { orderId: orderId }
            ]
        });

        if (!order) {
            console.log("Order not found for ID:", orderId);
            return next(createError(404, "Order not found"));
        }

        console.log("Found order:", order);

        // Verify seller owns this product
        const isSellerProduct = order.products.some(item =>
            item.seller && item.seller.toString() === req.user.id
        );

        if (!isSellerProduct) {
            return next(createError(403, "Not authorized to calculate earnings for this order"));
        }

        let updated = false;
        for (let item of order.products) {
            if (item.seller.toString() === req.user.id) {
                const product = await Product.findById(item.product);
                if (product) {
                    // Calculate earnings (80% to seller, 20% platform fee)
                    const price = Number(product.price) || 0;
                    const quantity = Number(item.quantity) || 1;
                    item.earnings = Math.round((price * quantity * 0.8) * 100) / 100;
                    updated = true;

                    // Update seller's earnings
                    await User.findByIdAndUpdate(
                        item.seller,
                        {
                            $inc: { earnings: item.earnings },
                            $push: {
                                earningsHistory: {
                                    amount: item.earnings,
                                    orderId: order._id,
                                    productId: item.product,
                                    type: 'sale',
                                    description: `Earnings from order #${order._id}`,
                                    timestamp: new Date()
                                }
                            }
                        }
                    );
                }
            }
        }

        if (updated) {
            await order.save();
        }

        res.status(200).json({
            success: true,
            message: "Earnings calculated successfully",
            order
        });

    } catch (error) {
        console.error("Error calculating earnings:", error);
        return next(createError(500, error.message));
    }
};

// Get seller earnings
export const getSellerEarnings = async (req, res, next) => {
    try {
        const seller = await User.findById(req.user.id);
        if (!seller) {
            return next(createError(404, "Seller not found"));
        }

        // Get total earnings
        const totalEarnings = seller.earnings || 0;

        // Get earnings history
        const earningsHistory = seller.earningsHistory || [];

        // Calculate pending payouts (earnings that haven't been withdrawn)
        const withdrawals = earningsHistory
            .filter(entry => entry.type === 'withdrawal')
            .reduce((total, entry) => total + entry.amount, 0);

        const availableBalance = totalEarnings - withdrawals;
        const pendingPayouts = earningsHistory
            .filter(entry => entry.type === 'withdrawal' && entry.status === 'pending')
            .reduce((total, entry) => total + entry.amount, 0);

        res.status(200).json({
            success: true,
            earnings: totalEarnings,
            availableBalance,
            pendingPayouts,
            earningsHistory: earningsHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        });

    } catch (error) {
        console.error("Error fetching seller earnings:", error);
        return next(createError(500, error.message));
    }
};

// Process withdrawal request
export const processWithdrawal = async (req, res, next) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return next(createError(400, "Invalid withdrawal amount"));
        }

        const seller = await User.findById(req.user.id);
        if (!seller) {
            return next(createError(404, "Seller not found"));
        }

        // Calculate available balance
        const totalEarnings = seller.earnings || 0;
        const withdrawals = (seller.earningsHistory || [])
            .filter(entry => entry.type === 'withdrawal')
            .reduce((total, entry) => total + entry.amount, 0);
        const availableBalance = totalEarnings - withdrawals;

        if (amount > availableBalance) {
            return next(createError(400, "Withdrawal amount exceeds available balance"));
        }

        // Add withdrawal to earnings history
        seller.earningsHistory.push({
            amount: Number(amount),
            type: 'withdrawal',
            status: 'pending',
            description: `Withdrawal request of ₹${amount}`,
            timestamp: new Date()
        });

        await seller.save();

        res.status(200).json({
            success: true,
            message: "Withdrawal request processed successfully"
        });

    } catch (error) {
        console.error("Error processing withdrawal:", error);
        return next(createError(500, error.message));
    }
};
