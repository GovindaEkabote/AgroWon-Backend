const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  productTitle: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  productId: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },

});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;