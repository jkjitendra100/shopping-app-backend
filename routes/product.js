import express from "express";
import {
	getAllProducts,
	getProductDetails,
	addNewProduct,
	updateProduct,
	addNewProductImage,
	deleteProductImage,
	deleteProduct,
	addNewCategory,
	getAllCategories,
	deleteCategory,
	getAllAdminProducts,
} from "../controllers/product.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import { multipleFileUpload, singleFileUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/my", getAllProducts);
router.get("/all", isAuthenticated, getAllAdminProducts); //Make admin access
router
	.route("/product/:id")
	.get(getProductDetails)
	.put(isAuthenticated, updateProduct) // make admin access
	.delete(isAuthenticated, isAdmin, deleteProduct);
router.post("/new", isAuthenticated, multipleFileUpload, addNewProduct); // make admin access
router
	.route("/images/:id")
	.post(isAuthenticated, isAdmin, singleFileUpload, addNewProductImage)
	.delete(isAuthenticated, isAdmin, deleteProductImage);

// Categories functions:
router.post("/category", isAuthenticated, isAdmin, addNewCategory);
router.get("/categories", getAllCategories);
router.delete("/category/:id", isAuthenticated, isAdmin, deleteCategory);

export default router;
