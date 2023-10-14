import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import ErrorHandler from "../utils/error.js";
import { asyncAwaitError, errorMiddleware } from "../middlewares/error.js";
import cloudinary from "cloudinary";
import {
  cookieOptions,
  getDataUri,
  sendEmail,
  sendToken,
} from "../utils/features.js";

// Login function
export const login = asyncAwaitError(async (req, res, next) => {
  const { email, password } = req.body;
  await User.findOne({ email })
    .select("+password")
    .then(async (user) => {
      if (!user) return next(new ErrorHandler("User doesn't exist!", 400));

      const isMatched = await bcrypt.compare(password, user.password);

      if (!isMatched) {
        return next(new ErrorHandler("Incorrect email or password!", 400));
      }

      sendToken(user, res, "User logged in successfully😊", 200);
    });
});

// Signup function
export const signup = asyncAwaitError(async (req, res, next) => {
  const {
    name,
    email,
    mobile,
    password,
    address1,
    address2,
    country,
    state,
    city,
    pinCode,
  } = req.body;

  // await User.findOne({ email }).then((user) => {
  // 	if (user) return next(new ErrorHandler("User already exists!", 400));
  // });

  let avatar = undefined;
  if (req.file) {
    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);

    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  await User.findOne({ email }).then((user) => {
    if (user) return next(new ErrorHandler("User already exists!", 400));
  });

  const user = await User.create({
    avatar,
    name,
    email,
    mobile,
    password,
    address1,
    address2,
    country,
    state,
    city,
    pinCode,
  });
  sendToken(user, res, "User registered successfully😊", 201);
});

// Logout function
export const logout = asyncAwaitError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res
    .status(200)
    .cookie("token", "", {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User logged out successfully",
    });
});

// Get  user profile function
export const getMyProfile = asyncAwaitError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update user Profile function
export const updateProfile = asyncAwaitError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email, address, city, pinCode, country } = req.body;

  if (
    name === user.name &&
    email === user.email &&
    address === user.address &&
    city === user.city &&
    pinCode === user.pinCode &&
    country === user.country
  ) {
    return res.status(400).json({
      success: false,
      message: "Nothing to update",
    });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (pinCode) user.pinCode = pinCode;
  if (country) user.country = country;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});

// Update user profile photo function
export const updateProfilePhoto = asyncAwaitError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const file = getDataUri(req.file);

  if (!file) return next(new ErrorHandler("Please choose profile photo", 400));

  cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar updated successfully",
  });
});

// Update password function
export const updatePassword = asyncAwaitError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword)
    return next(new ErrorHandler("Please enter old password", 400));
  if (!newPassword)
    return next(new ErrorHandler("Please enter new password", 400));
  const isMatched = await bcrypt.compare(oldPassword, user.password);
  if (!isMatched) {
    return next(new ErrorHandler("Incorrect old password!", 400));
  }
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// Forgot password
export const forgotPassword = asyncAwaitError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Please enter email", 400));
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("Incorrect email", 404));
  const randomNumber = Math.random() * (999999 - 100000) + 100000;
  const otp = Math.floor(randomNumber);
  const otpExpire = 15 * 60 * 1000;
  user.otp = otp;
  user.otp_expiry = new Date(Date.now() + otpExpire);
  const message = `Your OTP for resetting password is ${otp} and the opt is valid for 15 minutes.\n\n\nPlease ignore the message if you haven't requested.`;
  await user.save();
  try {
    await sendEmail(user.email, "OTP for resetting password", message);
  } catch (e) {
    user.otp = null;
    user.otp_expiry = null;
    await user.save();
    return next(e);
  }

  res.status(200).json({
    success: true,
    message: `Forgot password mail sent to ${user.email}. Kindly check your mail.`,
  });
});

// Reset password
export const resetPassword = asyncAwaitError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Get all users
export const getAllUsers = asyncAwaitError(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    success: true,
    user,
  });
});
