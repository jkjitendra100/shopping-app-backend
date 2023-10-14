import mongoose from "mongoose";

const schema = new mongoose.Schema({
  // shippingInfo: {
  //   address: {
  //     type: String,
  //     required: true,
  //   },
  //   city: {
  //     type: String,
  //     required: true,
  //   },
  //   country: {
  //     type: String,
  //     required: true,
  //   },
  //   pinCode: {
  //     type: Number,
  //     required: true,
  //   },
  // },

  selectedPlayers: [String],

  orderItems: [
    {
      name: {
        type: String,
        required: false,
      },

      price: {
        type: Number,
        required: false,
      },

      quantity: {
        type: Number,
        required: false,
      },

      image: {
        type: String,
        required: false,
      },

      product: {
        type: String,
        required: false,
      },
    },
  ],

  user: {
    type: String,
    ref: "User",
    required: false,
  },

  paymentMethod: {
    type: String,
    enum: ["CARD", "UPI"],
    default: "CARD",
  },

  paymentAt: Date,

  paymentInfo: {
    id: { type: String, required: false },
    status: { type: String, required: false },
  },

  itemsPrice: {
    type: Number,
    required: false,
  },

  taxPrice: {
    type: Number,
    required: false,
  },

  // shippingCharges: {
  //   type: Number,
  //   required: true,
  // },

  totalAmount: {
    type: Number,
    required: false,
  },

  orderStatus: {
    type: String,
    enum: ["Preparing", "Shipped", "Delivered"],
    default: "Preparing",
  },

  deliveredAt: Date,

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Order = mongoose.model("Order", schema);
