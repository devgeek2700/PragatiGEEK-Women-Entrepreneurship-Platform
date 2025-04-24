import createError from "../utils/error.js"
import JWT from 'jsonwebtoken'
import User from '../models/userModel.js'
import { isUserEnrolled } from "../utils/courseUtils.js"

export const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies

    if (!token) {
        return next(createError(401, "Please log in again"))
    }
    const userDetails = await JWT.verify(token, process.env.JWT_SECRET)
    req.user = userDetails


    next()
}

export const authorizedRole = (...rols) => async (req, res, next) => {
    const currentUserRole = req.user.role
    if (!rols.includes(currentUserRole)) {
        return next(createError(403, "You do not have permission"))
    }
    console.log(currentUserRole);
    next()
}

export const verifySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);

        if (!user) {
            return next(createError(404, "User not found"));
        }

        const subscription = user?.subscription?.status;
        const currentUserRole = user.role;

        if (currentUserRole !== 'ADMIN' && subscription !== 'active') {
            return next(createError(403, "Please subscribe to access this resource"));
        }

        next();
    } catch (error) {
        return next(createError(500, "Error verifying subscription"));
    }
}

// New middleware to verify course-specific enrollment
export const verifyCourseAccess = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id || req.params.courseId;
        const userRole = req.user.role;

        // Admins always have access
        if (userRole === 'ADMIN') {
            return next();
        }

        // For regular users, check enrollment
        if (!courseId) {
            return next(createError(400, "Course ID is required"));
        }

        const hasAccess = await isUserEnrolled(userId, courseId);

        if (!hasAccess) {
            return next(createError(403, "Please subscribe to access this resource"));
        }

        next();
    } catch (error) {
        console.error("Error verifying course access:", error);
        return next(createError(500, "Error verifying course access"));
    }
}