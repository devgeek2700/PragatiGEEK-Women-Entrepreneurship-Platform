import User from "../models/userModel.js";
import { createError } from "../utils/createError.js";

export const getEarnings = async (req, res, next) => {
    try {
        const seller = await User.findById(req.user.id)
            .select('earnings name email');

        if (!seller) {
            return next(createError(404, "Seller not found"));
        }

        res.status(200).json({
            success: true,
            earnings: seller.earnings,
            seller: {
                name: seller.name,
                email: seller.email
            }
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

        const seller = await User.findById(req.user.id)
            .select('earnings name');

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
            withdrawnAmount: amount
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

export const getEarningsHistory = async (req, res, next) => {
    try {
        const seller = await User.findById(req.user.id)
            .select('earningsHistory');

        if (!seller) {
            return next(createError(404, "Seller not found"));
        }

        res.status(200).json({
            success: true,
            history: seller.earningsHistory || []
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
}; 