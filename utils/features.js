import jwt from "jsonwebtoken";
import nodemailer, { createTransport } from "nodemailer";
import DataUriParser from "datauri/parser.js";
import path from "path";

export const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extname = path.extname(file.originalname).toString();
  return parser.format(extname, file.buffer); 
};

export const sendToken = (user, res, message, statusCode) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  res
    .status(200)
    .cookie("token", token, {
      ...cookieOptions,
      expires: new Date(Date.now() + 15 * 24 + 60 * 60 * 1000),
    })
    .json({ status: statusCode, message });
};

export const cookieOptions = {
  secure: (process.env.NODE_ENV = "Development" ? false : true),
  httpOnly: (process.env.NODE_ENV = "Development" ? false : true),
  sameSite: (process.env.NODE_ENV = "Development" ? false : "none"),
};

export const sendEmail = async (to, subject, message) => {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    to,
    subject,
    text: message,
  });
};
