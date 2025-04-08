import mongoose from "mongoose";



const productSchema = new mongoose.Schema({
    // Basic product information
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 1
    },
    category: {
        type: String,
        required: true
    },

    // Product images array
    images: [
        {
            public_id: { type: String, required: true },
            secure_url: { type: String, required: true }
        }
    ],

    // Reference to the seller (User model)
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
    {
        timestamps: true
    });

// Make sure model hasn't been registered
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// Use named export for consistency with other models
export { Product }; 