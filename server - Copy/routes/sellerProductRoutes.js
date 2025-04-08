import express from "express";
import { isLoggedIn, authorizedRole } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";
import { createProduct, getSellerProducts, updateProduct, deleteProduct } from "../controllers/productController.js";

const router = express.Router();

// Protected seller routes for product management
router.post(
    "/new",
    isLoggedIn,
    authorizedRole("SELLER"),
    upload.array("images", 5),
    createProduct
);

router.get(
    "/my-products",
    isLoggedIn,
    authorizedRole("SELLER"),
    getSellerProducts
);

router.put(
    "/:id",
    isLoggedIn,
    authorizedRole("SELLER"),
    upload.array("images", 5),
    updateProduct
);

router.delete(
    "/:id",
    isLoggedIn,
    authorizedRole("SELLER"),
    deleteProduct
);

export default router; 