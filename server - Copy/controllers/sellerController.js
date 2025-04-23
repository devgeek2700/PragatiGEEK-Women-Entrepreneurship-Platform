import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";
import User from "../models/userModel.js";
import { createError } from "../utils/createError.js";

// Helper function to calculate earnings
const calculateEarnings = (price) => {
  return Math.round(Number(price) * 0.8 * 100) / 100; // 80% to seller
};

// Function to update earnings for existing orders
const updateOrderEarnings = async (order) => {
  try {
    let updated = false;

    // Ensure order has type field
    if (!order.type) {
      order.type = "product"; // Default to product type for existing orders
    }

    for (let item of order.products) {
      if (!item.earnings || item.earnings === 0) {
        const product = await Product.findById(item.product);
        if (product) {
          const quantity = Number(item.quantity) || 1;
          const earnings = calculateEarnings(product.price * quantity);
          item.earnings = earnings;
          updated = true;

          // Update seller's earnings with detailed history
          await User.findByIdAndUpdate(item.seller, {
            $inc: { earnings: earnings },
            $push: {
              earningsHistory: {
                amount: earnings,
                orderId: order._id,
                productId: item.product,
                type: order.type === "course" ? "course_sale" : "sale",
                description:
                  order.type === "course"
                    ? `Course sale: ${product.name}`
                    : `Product sale: ${product.name}`,
                timestamp: order.createdAt,
                quantity: quantity,
                unitPrice: product.price,
                totalAmount: product.price * quantity,
              },
            },
          });
        }
      }
    }
    if (updated) {
      await order.save();
    }
    return order;
  } catch (error) {
    console.error("Error updating order earnings:", error);
    throw error;
  }
};

export const getSellerDashboardStats = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    console.log("Fetching stats for seller:", sellerId);

    // Get total products count for this seller
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    console.log("Total products:", totalProducts);

    // Get orders statistics with better filtering
    const orders = await Order.find({
      "products.seller": sellerId,
      status: { $ne: "Cancelled" },
      paymentStatus: "Paid",
    }).populate("products.product");
    console.log("Found orders:", orders.length);

    // Update earnings for orders if needed
    for (let order of orders) {
      await updateOrderEarnings(order);
    }

    // Recalculate total revenue with updated earnings
    const totalRevenue = orders.reduce((acc, order) => {
      const sellerProducts = order.products.filter(
        (product) => product.seller.toString() === sellerId
      );
      const orderRevenue = sellerProducts.reduce(
        (sum, product) => sum + (product.earnings || 0),
        0
      );
      console.log("Order revenue:", orderRevenue);
      return acc + orderRevenue;
    }, 0);
    console.log("Total revenue:", totalRevenue);

    // Get recent orders with more details
    const recentOrders = await Order.find({
      "products.seller": sellerId,
      status: { $ne: "Cancelled" },
      paymentStatus: "Paid",
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("buyer", "name email")
      .populate("products.product", "name price images");

    // Get monthly revenue data
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          "products.seller": sellerId,
          status: { $ne: "Cancelled" },
          paymentStatus: "Paid",
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.seller": sellerId,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          total: { $sum: "$products.earnings" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const stats = {
      totalProducts,
      totalOrders: orders.length,
      totalRevenue,
      recentOrders,
      monthlyRevenue,
    };
    console.log("Sending stats:", stats);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error in getSellerDashboardStats:", error);
    return next(createError(500, error.message));
  }
};
