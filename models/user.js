import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const user = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please enter name"],
	},

	email: {
		type: String,
		required: [true, "Please enter email"],
		unique: [true, "Email already in use"],
		validate: validator.isEmail,
	},

	password: {
		type: String,
		required: [true, "Please enter password"],
		minLength: [6, "Password must be at lease six characters long"],
		select: false,
	},

	address1: {
		type: String,
		required: true,
	},

	address2: {
		type: String,
		required: false,
	},

	country: {
		type: String,
		required: true,
	},

	state: {
		type: String,
		required: true,
	},

	city: {
		type: String,
		required: true,
	},

	pinCode: {
		type: Number,
		minLength: [6, "PIN code must be of six digits"],
		maxLength: [6, "PIN code must be of six digits"],
		required: true,
	},

	role: {
		type: String,
		enum: ["admin", "user"],
		default: "user",
	},

	avatar: {
		public_id: String,
		url: String,
	},

	otp: Number,
	otp_expiry: Date,
});

user.pre("save", async function (next) {
	if(!this.isModified("password")) return next()
	this.password = await bcrypt.hash(this.password, 10);
});

export const User = mongoose.model("User", user);
