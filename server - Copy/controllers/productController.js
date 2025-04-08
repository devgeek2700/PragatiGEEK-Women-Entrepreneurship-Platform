import { Product } from "../models/productModel.js";
import createError from "../utils/error.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

// Create a new product
export const createProduct = async (req, res, next) => {
    try {
        // Validate required fields
        const { name, description, price, stock, category } = req.body;
        if (!name || !description || !price || !stock || !category) {
            return next(createError(400, "All fields are required"));
        }

        console.log(req.body);

        // Handle image uploads
        let images = [];
        if (req.files) {
            for (let file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "products"
                });
                images.push({
                    public_id: result.public_id,
                    secure_url: result.secure_url
                });
                await fs.rm(file.path);
            }
        }

        // Create product
        const newProduct = await Product.create({
            name,
            description,
            price,
            stock,
            category,
            images,
            seller: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Get all products for a seller
export const getSellerProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ seller: req.user.id });
        res.status(200).json({ success: true, products });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Update product
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) return next(createError(404, "Product not found"));

        // Verify seller ownership
        if (req.user.id !== product.seller.toString()) {
            return next(createError(403, "Unauthorized access"));
        }

        // Handle image updates
        let images = product.images;
        if (req.files) {
            for (let file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "products"
                });
                images.push({
                    public_id: result.public_id,
                    secure_url: result.secure_url
                });
                await fs.rm(file.path);
            }
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { ...req.body, images },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Delete product
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) return next(createError(404, "Product not found"));

        // Verify seller ownership
        if (req.user.id !== product.seller.toString()) {
            return next(createError(403, "Unauthorized access"));
        }

        // Delete product images from cloudinary
        for (let img of product.images) {
            await cloudinary.uploader.destroy(img.public_id);
        }

        // Delete product from database
        await Product.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Get all products
export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find()
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Get product by ID
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email');

        if (!product) return next(createError(404, "Product not found"));

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Get products by category
export const getProductsByCategory = async (req, res, next) => {
    try {
        const products = await Product.find({ category: req.params.category })
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

// Search products
export const searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query;
        const products = await Product.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ]
        })
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
}; 