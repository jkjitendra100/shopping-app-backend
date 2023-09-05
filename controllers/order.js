import { asyncAwaitError } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/error.js";
import { stripe } from "../server.js";

export const processPayment = asyncAwaitError(async (req, res, next) => {
  const { totalAmount } = req.body;

  if (!totalAmount || totalAmount <= 0)
    return next(new ErrorHandler("Please enter valid amount"));

  const { clientSecret } = await stripe.paymentIntents.create({
    amount: Number(totalAmount) * 100, // in paisa
    currency: "inr",
  });

  res.status(201).json({
    success: true,
    clientSecret,
  });
});

export const createOrder = asyncAwaitError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentNMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  } = req.body;

  await Order.create({
    user: req.user._id,
    shippingInfo,
    orderItems,
    paymentNMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  });

  // Reduce the product stock
  for (let i = 0; i < orderItems.length; i++) {
    const product = await Product.findById(orderItems[i].product);
    product.stock -= orderItems[i].quantity;
    await product.save();
  }

  res.status(201).json({
    success: true,
    message: "Order places successfully",
  });
});

export const getAdminOrders = asyncAwaitError(async (req, res, next) => {
  const orders = await Order.find({});

  if (!orders) return next(new ErrorHandler("No order found", 404));

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getMyOrders = asyncAwaitError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  if (!orders) return next(new ErrorHandler("No order found", 404));

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrderDetails = asyncAwaitError(async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorHandler("Please provide order id", 400));

  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("No order found", 404));

  res.status(200).json({
    success: true,
    order,
  });
});

export const processOrder = asyncAwaitError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("No order found", 404));

  if (order.orderStatus === "Preparing") order.orderStatus = "Shipped";
  else if (order.orderStatus === "Shipped") {
    (order.orderStatus = "Delivered"),
      (order.deliveredAt = new Date(Date.now()));
  } else return next(new ErrorHandler("Order already delivered", 400));

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order processed successfully",
  });
});
