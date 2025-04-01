const express = require("express");
const AdditionalProductInfo = require("../Models/productAdditionInfo");
const Products = require("../models/products"); 
const router = express.Router();

router.post("/create-proinfo", async (req, res) => {
  try {
    const product = await Products.findById(req.body.product); 
    if (!product) {
      return res.status(400).json({ message: "Product Not Found" });
    }

    const addInfo = new AdditionalProductInfo({
      product: req.body.product, 
      itemWeight: req.body.itemWeight,
      itemForm: req.body.itemForm,
      manufacturer: req.body.manufacturer,
      netQuantity: req.body.netQuantity,
      modelNumber: req.body.modelNumber,
      countryOfOrigin: req.body.countryOfOrigin,
      productDimensions: req.body.productDimensions,
      asin: req.body.asin,
      specificUses: req.body.specificUses,
      itemHeight: req.body.itemHeight,
      itemWidth: req.body.itemWidth,
    });

    await addInfo.save();
    return res.status(200).json({
      message: "Additional info added successfully",
      success: true,
      addInfo,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
