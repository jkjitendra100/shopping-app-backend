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
  showCartItems,
} from "../controllers/product.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import { multipleFileUpload, singleFileUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/my", isAuthenticated, getAllProducts);
router.get("/all", getAllAdminProducts);
router
  .route("/product/:id")
  .get(getProductDetails)
  .put(isAuthenticated, isAdmin, updateProduct)
  .delete(isAuthenticated, isAdmin, deleteProduct);
router.post("/new", isAuthenticated, isAdmin, multipleFileUpload, addNewProduct);
router
  .route("/images/:id")
  .post(isAuthenticated, isAdmin, singleFileUpload, addNewProductImage)
  .delete(isAuthenticated, isAdmin, deleteProductImage);

// Categories functions:
router.post("/category", isAuthenticated, isAdmin, addNewCategory);
router.get("/categories", getAllCategories);
router.delete("/category/:id", isAuthenticated, isAdmin, deleteCategory);

// Get cart products
router.get("/cartItems", isAuthenticated, showCartItems);

export default router;
