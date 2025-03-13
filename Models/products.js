const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subCategory: {  // Fixed Typo
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  oldPrice: {  // Use camelCase
    type: Number,
    default: 0,
  },
  isFeatured: {  // Fixed Naming
    type: Boolean,
    default: false,
  },
  countInStock: {
    type: Number,
    required: true,
  },
  discount: {  // Optional Discount
    type: Number,
    default: 0,
  },
  weight: [
    {
      type: String,
    },
  ],
  quantity: [
    {
      type: String,
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  
  brand: {
    type: String,
    default: "",
  },
  images: [  
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ], 
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Products = mongoose.model("Products", productSchema);
module.exports = Products;
