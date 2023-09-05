import { asyncAwaitError } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/error.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";
import { Category } from "../models/category.js";

export const getAllProducts = asyncAwaitError(async (req, res, next) => {
  const { keywords, category } = req.query;
  const products = await Product.find({
    name: {
      $regex: keywords ? keywords : "",
      $options: "i",
    },
    category: category ? category : undefined
  });

  res.status(200).json({
    success: true,
    products,
  });
});

export const getAllAdminProducts = asyncAwaitError(async (req, res, next) => {
  // Search and category query
  const products = await Product.find({}).populate("category");

  const outOfStock = products.find((e)=> e.stock === 0)

  res.status(200).json({
    success: true,
    products,
    outOfStock: outOfStock.length,
    inStock: products.length - outOfStock.length
  });
});

export const getProductDetails = asyncAwaitError(async (req, res, next) => {
  const product = await Product.find({ _id: req.params.id }).populate("category");
  if (!product) return next(new ErrorHandler("Product not found", 404));

  res.status(200).json({
    success: true,
    product,
  });
});

export const addNewProduct = asyncAwaitError(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;
  if (!req.file)
    return next(new ErrorHandler("Please choose product image", 400));

  if (!name) return next(new ErrorHandler("Please enter product name", 400));
  if (!description)
    return next(new ErrorHandler("Please enter product description", 400));
  if (!price) return next(new ErrorHandler("Please enter product price", 400));
  if (!category)
    return next(new ErrorHandler("Please select product category", 400));
  if (!stock) return next(new ErrorHandler("Please enter product stock", 400));

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await Product.create({
    name,
    description,
    price: Number(price),
    category,
    stock,
    images: [image],
  });

  res.status(200).json({
    success: true,
    message: "Product added successfully",
  });
});

export const updateProduct = asyncAwaitError(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (category) product.category = category;
  if (stock) product.stock = stock;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
  });
});

export const addNewProductImage = asyncAwaitError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  if (!req.file)
    return next(new ErrorHandler("Please choose product image", 400));

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  product.images.push(image);
  await product.save();

  res.status(200).json({
    success: true,
    message: "Image added successfully",
  });
});

export const deleteProductImage = asyncAwaitError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  const id = req.query.id;
  if (!id) return next(new ErrorHandler("Please enter image id", 400));

  let isExist = -1;

  product.images.forEach((item, index) => {
    if (item._id.toString() === id.toString()) isExist = index;
  });

  if (isExist < 0) return next(new ErrorHandler("Image not found", 404));
  await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
  product.images.splice(isExist, 1);
  await product.save();

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
});

export const deleteProduct = asyncAwaitError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  for (let index = 0; index < product.images.length; index++) {
    await cloudinary.v2.uploader.destroy(product.images[index].public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// Categories functions:

export const addNewCategory = asyncAwaitError(async (req, res, next) => {
  const { category } = req.body;

  const existingCategory = await Category.find({ category });

  if (existingCategory?.length > 0)
    return next(new ErrorHandler("Category already exists", 400));

  if (!category) return next(new ErrorHandler("Please enter category", 400));

  await Category.create({ category });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
  });
});

export const getAllCategories = asyncAwaitError(async (req, res, next) => {
  const categories = await Category.find({});

  res.status(200).json({
    success: true,
    categories,
  });
});

export const deleteCategory = asyncAwaitError(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  console.log(category._id);

  if (!category)
    return next(new ErrorHandler("Category not found in database", 404));

  const products = Product.find({ category: category._id });

  for (let i = 0; i < products.length; i++) {
    products[i].category = undefined;
    await products[i].save();
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
