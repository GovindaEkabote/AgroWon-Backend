const express = require("express");
const AdditionalProductInfo = require("../Models/productAdditionInfo");
const Products = require("../models/products");
const router = express.Router();

router.post("/create-proinfo", async (req, res) => {
  try {
    const product = await Products.findOne({ productId: req.body.productId });

    if (!product) {
      return res.status(400).json({ message: "Product Not Found" });
    }

    const addInfo = new AdditionalProductInfo({
      productId: req.body.productId,
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
      message: "Additional product info added successfully",
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

router.get("/get-info", async (req, res) => {
  try {
    const products = await Products.find().lean();
    const info = await Promise.all(
      products.map(async (product) => {
        const additonaInfo = await AdditionalProductInfo.findOne({
          product: product._id,
        }).lean();
        return {
          ...product,
          additonaInfo: additonaInfo || null,
        };
      })
    );
    return res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      products: info,
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
