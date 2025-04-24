import { Payment } from "../models/paymentModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

/**
 * Checks if a user is enrolled in a course through either payments or active subscription
 * @param {string} userId - The user ID
 * @param {string} courseId - The course ID
 * @returns {Promise<boolean>} True if user is enrolled, false otherwise
 */
export const isUserEnrolled = async (userId, courseId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
            return false;
        }

        // Check payment records
        const payment = await Payment.findOne({
            user: userId,
            course_id: courseId,
            status: { $in: ["succeeded", "successful"] },
            order_type: "course"
        });

        if (payment) {
            return true;
        }

        // Check active subscriptions
        const user = await User.findById(userId);
        if (!user || !user.subscriptions || user.subscriptions.length === 0) {
            return false;
        }

        // Check if any active subscription includes this course
        const isSubscribed = user.subscriptions.some(
            sub => sub.status === 'active' &&
                sub.courseId &&
                sub.courseId.toString() === courseId.toString()
        );

        return isSubscribed;
    } catch (error) {
        console.error("Error checking enrollment status:", error);
        return false;
    }
}; 