import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import jwt from "jsonwebtoken";
import { asyncAwaitError } from "./error.js";

export const isAuthenticated = asyncAwaitError(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return next(new ErrorHandler("Not logged in", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData._id);
  next();
});

export const isAdmin = asyncAwaitError(async (req, res, next) => {
  if (req.user.role !== "admin")
    return next(
      new ErrorHandler("This action can be performed by admin only", 401)
    );
  next();
});
