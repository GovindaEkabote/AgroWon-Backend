const mongoose = require("mongoose");

const additionalInfoSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        ref: "Product",
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

const AdditionalProductInfo = mongoose.model("AdditionalProductInfo", additionalInfoSchema);
module.exports = AdditionalProductInfo;
