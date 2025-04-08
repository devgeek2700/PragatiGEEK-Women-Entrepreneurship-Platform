import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    // Reference to the user who placed the order
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Type of order
    type: {
        type: String,
        enum: ['product', 'course'],
        required: true
    },

    // Array of products in the order
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1']
            },
            // Add seller reference and earnings
            seller: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            earnings: {
                type: Number,
                default: 0
            }
        }
    ],

    // Total amount of the order
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },

    // Order status tracking
    status: {
        type: String,
        enum: ["Pending", "Processing", "Completed", "Cancelled"],
        default: "Pending"
    },

    // Payment information
    paymentMethod: {
        type: String,
        required: true,
        enum: ["Card", "UPI", "NetBanking", "WALLET", "ONLINE"]
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },

    // Shipping details
    shippingAddress: {
        type: Object,
        required: function () {
            return this.type === 'product';
        },
        validate: {
            validator: function (address) {
                if (this.type === 'product') {
                    return address && address.name && address.street &&
                        address.city && address.state && address.pinCode;
                }
                return true;
            },
            message: 'Shipping address required for product orders'
        }
    },

    trackingNumber: {
        type: String,
        default: ""
    },
    expectedDelivery: {
        type: Date
    }
},
    {
        timestamps: true
    });

// Add index for faster queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ buyer: 1, status: 1 }); // Add index for faster search by buyer and status

// Make sure model hasn't been registered
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export { Order };
