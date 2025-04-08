import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    payment_id: {
        type: String,
        required: true
    },
    payment_type: {
        type: String,
        enum: ['payment_intent', 'payment_method', 'subscription'],
        required: true
    },
    order_type: {
        type: String,
        enum: ['product', 'course'],
        required: true
    },
    customer_id: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscription_id: {
        type: String,
        required: false
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: false
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: function () {
            return this.order_type === 'course';
        }
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed', 'refunded', 'succeeded'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'inr'
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: Map,
        of: String,
        default: {}
    },
    payment_method: {
        type: String,
        enum: ["Card", "UPI", "NetBanking", "WALLET", "ONLINE"],
        required: true
    }
}, { timestamps: true });

// Pre-save middleware to ensure proper ObjectId conversion
paymentSchema.pre('save', function (next) {
    // Convert string IDs to ObjectIds if needed
    if (this.user && typeof this.user === 'string') {
        try {
            this.user = new mongoose.Types.ObjectId(this.user);
        } catch (error) {
            next(new Error('Invalid user ID format'));
            return;
        }
    }

    if (this.course_id && typeof this.course_id === 'string') {
        try {
            this.course_id = new mongoose.Types.ObjectId(this.course_id);
        } catch (error) {
            next(new Error('Invalid course ID format'));
            return;
        }
    }

    if (this.order_id && typeof this.order_id === 'string') {
        try {
            this.order_id = new mongoose.Types.ObjectId(this.order_id);
        } catch (error) {
            next(new Error('Invalid order ID format'));
            return;
        }
    }

    next();
});

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ course_id: 1, status: 1 });
paymentSchema.index({ order_id: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);

