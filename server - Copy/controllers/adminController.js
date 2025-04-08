import User from "../models/userModel.js";
import { Order } from "../models/orderModel.js";
import Course from "../models/courseModel.js";
import { Product } from "../models/productModel.js";
import { Payment } from "../models/paymentModel.js";
import createError from "../utils/error.js";

// Get Admin Dashboard Statistics
export const getAdminDashboardStats = async (req, res, next) => {
    try {
        // Get basic statistics
        const totalUsers = await User.countDocuments({ role: "USER" });
        const totalSellers = await User.countDocuments({ role: "SELLER" });
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalCourses = await Course.countDocuments();

        // Get revenue statistics
        const revenueStats = await Order.aggregate([
            {
                $match: {
                    status: { $ne: "Cancelled" },
                    paymentStatus: "Paid"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" },
                    maxOrderValue: { $max: "$totalAmount" },
                    minOrderValue: { $min: "$totalAmount" }
                }
            }
        ]);

        // Get recent orders with more details
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('buyer', 'name email')
            .populate('products.product', 'name price images')
            .populate('products.seller', 'name email')
            .select('totalAmount status paymentStatus createdAt shippingAddress');

        // Get monthly revenue data for the current year
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    status: { $ne: "Cancelled" },
                    paymentStatus: "Paid",
                    createdAt: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear + 1, 0, 1)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Get top selling products
        const topProducts = await Order.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product",
                    totalSales: { $sum: "$products.quantity" },
                    revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" }
        ]);

        // Get top selling courses
        const topCourses = await Payment.aggregate([
            {
                $match: {
                    order_type: "course",
                    status: "succeeded"
                }
            },
            {
                $group: {
                    _id: "$course_id",
                    totalSales: { $sum: 1 },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "_id",
                    as: "courseDetails"
                }
            },
            { $unwind: "$courseDetails" }
        ]);

        // Get top sellers
        const topSellers = await Order.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.seller",
                    totalSales: { $sum: "$products.quantity" },
                    revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "sellerDetails"
                }
            },
            { $unwind: "$sellerDetails" },
            {
                $project: {
                    "sellerDetails.password": 0,
                    "sellerDetails.forgotPasswordToken": 0,
                    "sellerDetails.forgotPasswordExpiry": 0
                }
            }
        ]);

        // Format monthly data for chart
        const months = Array.from({ length: 12 }, (_, i) => {
            const monthData = monthlyRevenue.find(item => item._id === i + 1) || {
                revenue: 0,
                orders: 0
            };
            return {
                month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
                revenue: monthData.revenue || 0,
                orders: monthData.orders || 0
            };
        });

        res.status(200).json({
            success: true,
            stats: {
                counts: {
                    users: totalUsers,
                    sellers: totalSellers,
                    orders: totalOrders,
                    products: totalProducts,
                    courses: totalCourses
                },
                revenue: {
                    total: revenueStats[0]?.totalRevenue || 0,
                    average: revenueStats[0]?.averageOrderValue || 0,
                    max: revenueStats[0]?.maxOrderValue || 0,
                    min: revenueStats[0]?.minOrderValue || 0
                },
                recentOrders,
                monthlyData: months,
                topProducts,
                topCourses,
                topSellers
            }
        });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        return next(createError(500, error.message));
    }
}; 