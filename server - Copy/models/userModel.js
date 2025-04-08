import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import crypto from 'crypto';
import { stripe } from '../server.js';

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minLength: [3, 'Name must be at least 3 characters'],
        maxLength: [15, 'Name should be less than 15 characters'],
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 characters'],
        match: [/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'],
        select: false
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN', 'SELLER'],
        default: 'USER'
    },
    earnings: {
        type: Number,
        default: 0
    },
    earningsHistory: [{
        amount: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['sale', 'course_sale', 'withdrawal'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled'],
            default: 'pending'
        },
        description: String,
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    stripeCustomerId: String,
    subscriptions: [{
        id: String,
        status: {
            type: String,
            enum: ['active', 'inactive', 'cancelled', 'expired'],
            default: 'active'
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: Date,
        paymentIntentId: String
    }],
    storeDetails: {
        storeName: String,
        storeDescription: String,
        storeLogo: {
            public_id: String,
            secure_url: String
        }
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);

    if (this.subscriptions) {
        this.subscriptions.forEach(sub => {
            if (sub.courseId && typeof sub.courseId === 'string') {
                try {
                    sub.courseId = new Schema.Types.ObjectId(sub.courseId);
                } catch (error) {
                    next(new Error('Invalid course ID format in subscription'));
                    return;
                }
            }
        });
    }

    if (this.earningsHistory) {
        this.earningsHistory.forEach(entry => {
            ['orderId', 'productId', 'courseId'].forEach(field => {
                if (entry[field] && typeof entry[field] === 'string') {
                    try {
                        entry[field] = new Schema.Types.ObjectId(entry[field]);
                    } catch (error) {
                        next(new Error(`Invalid ${field} format in earnings history`));
                        return;
                    }
                }
            });
        });
    }

    next();
});

userSchema.methods = {
    generateToken: async function () {
        return await JWT.sign(
            {
                id: this._id,
                email: this.email,
                role: this.role,
                subscriptions: this.subscriptions?.filter(sub => sub.status === 'active')
            },
            process.env.JWT_SECRET
        );
    },
    generateResetToken: async function () {
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

        return resetToken;
    },
    createOrRetrieveStripeCustomer: async function () {
        if (this.stripeCustomerId) {
            return await stripe.customers.retrieve(this.stripeCustomerId);
        }
        const customer = await stripe.customers.create({
            email: this.email,
            name: this.name,
            metadata: {
                userId: this._id.toString()
            }
        });
        this.stripeCustomerId = customer.id;
        await this.save();
        return customer;
    },
    createSubscription: async function (priceId) {
        const customer = await this.createOrRetrieveStripeCustomer();
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent']
        });
        this.subscriptions.push({
            id: subscription.id,
            status: subscription.status,
            courseId: subscription.items.data[0].price.product,
            startDate: Date.now(),
            paymentIntentId: subscription.latest_invoice.payment_intent
        });
        await this.save();
        return subscription;
    },
    cancelSubscription: async function () {
        if (!this.subscriptions.length) {
            throw new Error('No active subscriptions found');
        }
        const subscription = await stripe.subscriptions.del(this.subscriptions[0].id);
        this.subscriptions[0].status = subscription.status;
        await this.save();
        return subscription;
    },
    hasAccessToCourse: function (courseId) {
        if (!this.subscriptions) return false;
        return this.subscriptions.some(sub =>
            sub.courseId.toString() === courseId.toString() &&
            sub.status === 'active' &&
            (!sub.endDate || new Date(sub.endDate) > new Date())
        );
    }
};

const User = model('User', userSchema);

export default User;