// Public routes for all users to view products
import { Router } from "express";
import { isLoggedIn } from "../middleware/authMiddleware.js";
import { getAllProducts, getProductById, getProductsByCategory, searchProducts } from "../controllers/productController.js";

const router = Router();

// Public routes
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

export default router;






