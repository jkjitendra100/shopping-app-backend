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
import { singleFileUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/all", getAllProducts);
router.get("/adminAllProducts", isAuthenticated, isAdmin, getAllAdminProducts);
router
  .route("/product/:id")
  .get(getProductDetails)
  .put(isAuthenticated, isAdmin, updateProduct)
  .delete(isAuthenticated, isAdmin, deleteProduct);
router.post("/new", isAuthenticated, isAdmin, singleFileUpload, addNewProduct);
router
  .route("/images/:id")
  .post(isAuthenticated, isAdmin, singleFileUpload, addNewProductImage)
  .delete(isAuthenticated, isAdmin, deleteProductImage);
  

// Categories functions:
router.post("/category", isAuthenticated, isAdmin, addNewCategory)
router.get("/categories", getAllCategories)
router.delete("/category/:id", isAuthenticated, isAdmin, deleteCategory)

export default router;
