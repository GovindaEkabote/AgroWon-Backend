const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const productSchema = mongoose.Schema({
  productId: {
    type: String,
    unique: true,
    default: uuidv4, // Generates a unique product ID
  },
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
  subCategory: { 
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
  itemWeight: {
    type: String,
    required: true,
  },
  itemForm: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  netQuantity: {
    type: String,
    required: true,
  },
  modelNumber: {
    type: String,
    required: true,
  },
  countryOfOrigin: {
    type: String,
    required: true,
  },
  productDimensions: {
    type: String,
    required: true,
  },
  asin: {
    type: String,
    required: true,
  },
  specificUses: {
    type: String,
    required: true,
  },
  itemHeight: {
    type: String,
    required: true,
  },
  itemWidth: {
    type: String,
    required: true,
  },
});

const Products = mongoose.model("Products", productSchema);
module.exports = Products;
