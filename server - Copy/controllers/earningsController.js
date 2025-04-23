import User from "../models/userModel.js";
import { Order } from "../models/orderModel.js";
import { Payment } from "../models/paymentModel.js";
import { createError } from "../utils/createError.js";

export const getEarnings = async (req, res, next) => {
  try {
    const seller = await User.findById(req.user.id).select(
      "earnings name email"
    );

    if (!seller) {
      return next(createError(404, "Seller not found"));
    }

    const completedOrders = await Order.find({
      "products.seller": req.user.id,
      status: "Completed",
      paymentStatus: "Paid",
    });

    let totalEarnings = 0;
    let productSales = 0;
    let courseSales = 0;

    completedOrders.forEach((order) => {
      order.products.forEach((item) => {
        if (item.seller.toString() === req.user.id) {
          const earnings = item.earnings || item.price * item.quantity * 0.8;
          totalEarnings += earnings;

          if (order.type === "course") {
            courseSales += earnings;
          } else {
            productSales += earnings;
          }
        }
      });
    });

    seller.earnings = totalEarnings;
    await seller.save();

    res.status(200).json({
      success: true,
      earnings: {
        total: totalEarnings,
        productSales,
        courseSales,
      },
      seller: {
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return next(createError(400, "Please provide a valid withdrawal amount"));
    }

    const seller = await User.findById(req.user.id).select("earnings name");

    if (!seller) {
      return next(createError(404, "Seller not found"));
    }

    if (amount > seller.earnings) {
      return next(createError(400, "Insufficient balance"));
    }

    seller.earnings -= amount;
    await seller.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal request for ₹${amount} processed successfully`,
      remainingBalance: seller.earnings,
      withdrawnAmount: amount,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

export const getEarningsHistory = async (req, res, next) => {
  try {
    const seller = await User.findById(req.user.id).select("earningsHistory");

    if (!seller) {
      return next(createError(404, "Seller not found"));
    }

    // Fetch completed orders for the seller
    const completedOrders = await Order.find({
      "products.seller": req.user.id,
      status: "Completed",
      paymentStatus: "Paid",
    }).populate("products.product");

    // Fetch payments related to those completed orders
    const completedPayments = await Payment.find({
      order_id: { $in: completedOrders.map((order) => order._id) },
      status: "succeeded",
    });

    // Combine earnings history with completed payments
    const earningsHistory = seller.earningsHistory || [];
    const completedEarnings = completedPayments.map((payment) => {
      const order = completedOrders.find((order) =>
        order._id.equals(payment.order_id)
      );
      const orderType = order ? order.type : "unknown"; // Determine order type

      return {
        amount: payment.amount,
        type: orderType === "course" ? "course_sale" : "sale",
        description: `Payment for ${orderType}: ${payment.description}`,
        timestamp: payment.createdAt,
        orderId: payment.order_id,
      };
    });

    // Combine both histories
    const combinedHistory = [...earningsHistory, ...completedEarnings];

    res.status(200).json({
      success: true,
      history: combinedHistory,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
