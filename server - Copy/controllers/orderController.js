import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";
import createError from "../utils/error.js";
import sendMail from "../utils/sendMail.js";

// Create an Order
export const createOrder = async (req, res, next) => {
    try {
        const { products, totalAmount, paymentMethod, shippingAddress } = req.body;
        console.log(req.body);

        // Validate required fields
        if (!products?.length || !totalAmount || !paymentMethod || !shippingAddress) {
            return next(createError(400, "Please provide all required fields"));
        }

        // Validate shipping address
        const { street, city, state, zipCode } = shippingAddress;
        if (!street || !city || !state || !zipCode) {
            return next(createError(400, "Please provide complete shipping address"));
        }

        // Validate and check product stock
        let calculatedTotal = 0;
        for (let item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return next(createError(404, `Product not found with id: ${item.product}`));
            }
            if (product.stock < item.quantity) {
                return next(createError(400, `${product.name} is out of stock. Available: ${product.stock}`));
            }

            // Calculate total amount
            calculatedTotal += product.price * item.quantity;

            // Update product stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Verify total amount
        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            return next(createError(400, "Total amount calculation mismatch"));
        }

        const newOrder = await Order.create({
            buyer: req.user.id,
            products,
            totalAmount,
            paymentMethod,
            shippingAddress,
            status: "Pending",
            paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
        });

        // // Send confirmation email
        // const emailHtml = `
        //     <h2>Order Confirmation</h2>
        //     <p>Thank you for your purchase!</p>
        //     <p><strong>Order ID:</strong> ${newOrder._id}</p>
        //     <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
        //     <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        //     <p><strong>Payment Status:</strong> ${newOrder.paymentStatus}</p>
        //     <p><strong>Shipping Address:</strong><br/>
        //        ${street},<br/>
        //        ${city},<br/>
        //        ${state} - ${zipCode}
        //     </p>
        //     <p>We will notify you when your order is shipped.</p>
        //     <br/>
        //     <p>If you have any questions, please contact our support team.</p>
        // `;

        // await sendMail(
        //     process.env.GMAIL_ID,
        //     req.user.email,
        //     "Order Confirmation - Your Order #" + newOrder._id,
        //     emailHtml
        // );

        // Populate product details in response
        await newOrder.populate("products.product");

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: newOrder
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Get orders for a buyer
export const getUserOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ buyer: req.user.id })
            .populate("products.product")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Get orders for a seller
export const getSellerOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate({
                path: "products.product",
                match: { seller: req.user.id }
            })
            .populate("buyer", "name email");

        // Filter orders that have products belonging to the seller
        const sellerOrders = orders.filter(order =>
            order.products.some(item => item.product)
        );

        res.status(200).json({
            success: true,
            count: sellerOrders.length,
            orders: sellerOrders
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Update order status with tracking info
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber, expectedDelivery } = req.body;

        // Find order and populate buyer details
        const order = await Order.findById(id)
            .populate("buyer")
            .populate("products.product");

        if (!order) return next(createError(404, "Order not found"));

        // Update order details
        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (expectedDelivery) order.expectedDelivery = expectedDelivery;
        await order.save();

        // Prepare email content with order details
        const emailHtml = `
            <h2>Order Status Update</h2>
            <p>Hello ${order.buyer.name},</p>
            <p>Your order #${order._id} has been updated to: <strong>${status}</strong></p>
            
            ${trackingNumber ? `
            <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
            ` : ''}
            
            ${expectedDelivery ? `
            <p><strong>Expected Delivery:</strong> ${new Date(expectedDelivery).toLocaleDateString()}</p>
            ` : ''}
            
            <h3>Order Details:</h3>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            
            <h3>Shipping Address:</h3>
            <p>
                ${order.shippingAddress.street},<br/>
                ${order.shippingAddress.city},<br/>
                ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}
            </p>
            
            <p>If you have any questions about your order, please contact our support team.</p>
            <p>Thank you for shopping with us!</p>
        `;

        // Send email notification
        await sendMail(
            process.env.GMAIL_ID,
            order.buyer.email,
            `Order Status Update - ${status}`,
            emailHtml
        );

        res.status(200).json({
            success: true,
            message: "Order status updated and notification sent",
            order
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Track order details
export const trackOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return next(createError(404, "Order not found"));

        res.status(200).json({
            success: true,
            trackingNumber: order.trackingNumber,
            status: order.status,
            expectedDelivery: order.expectedDelivery
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// get order details and payment details and product details  to show in view order product

// Get detailed order information by ID
export const getOrderDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate("buyer", "name email")
            .populate("products.product");

        if (!order) {
            return next(createError(404, "Order not found"));
        }

        // Verify user authorization (only buyer or seller of products can view)
        const isBuyer = order.buyer._id.toString() === req.user.id;
        const isSeller = order.products.some(item =>
            item.product.seller.toString() === req.user.id
        );

        if (!isBuyer && !isSeller) {
            return next(createError(403, "Not authorized to view this order"));
        }

        res.status(200).json({
            success: true,
            order: {
                ...order.toObject(),
                products: order.products.map(item => ({
                    product: item.product,
                    quantity: item.quantity
                }))
            }
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};