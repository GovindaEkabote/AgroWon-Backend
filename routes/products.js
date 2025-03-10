const express = require("express");
const Products = require("../models/products");
const Category = require("../models/category");
const cloudinary = require("../config/cloudinary");
const pLimit = require("p-limit");

const router = express.Router();

router.get("/get-product", async (req, res) => {
  try {
    const products = await Products.find().populate("category");
    const totalProducts = await Products.countDocuments();
    if (!products) {
      return res.status(500).json({ message: "Product Not Found.." });
    }
    res.status(200).json({ success: true, total: totalProducts, products });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});

router.post("/create-product", async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({ message: "Invalid Category!" });
    }

    const limit = pLimit(2);

    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({
        message: "Invalid images array",
        success: false,
      });
    }

    // Upload images concurrently with limit
    const imagesToUpload = req.body.images.map((image) =>
      limit(async () => {
        try {
          return await cloudinary.uploader.upload(image);
        } catch (error) {
          return { error: error.message }; // Capture individual errors
        }
      })
    );

    const uploadStatus = await Promise.all(imagesToUpload);

    // Extract successful image URLs and filter out failed uploads
    const imgUrl = uploadStatus
      .filter((item) => !item.error)
      .map((item) => item.secure_url);

    // If all uploads failed
    if (imgUrl.length === 0) {
      return res.status(500).json({
        message: "Images upload failed",
        success: false,
        errors: uploadStatus.filter((item) => item.error),
      });
    }

    // Create Product
    let product = new Products({
      name: req.body.name,
      description: req.body.description,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      ifFeatured: req.body.ifFeatured,
    });
    await product.save();

    // Send success response
    return res.status(201).json({
      message: "Product added successfully.",
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});

router.delete("/delete-product/:id", async (req, res) => {
  try {
    const deleteProduct = await Products.findByIdAndDelete(req.params.id);
    if (!deleteProduct) {
      return res.status(401).json({ message: "Product Not Found" });
    }
    res.status(200).json({
      message: "the product deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});

router.get("/get/:id", async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const limit = pLimit(2);

    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({
        message: "Invalid images array",
        success: false,
      });
    }

    // Upload images concurrently with limit
    const imagesToUpload = req.body.images.map((image) =>
      limit(async () => {
        try {
          return await cloudinary.uploader.upload(image);
        } catch (error) {
          return { error: error.message }; // Capture individual errors
        }
      })
    );

    const uploadStatus = await Promise.all(imagesToUpload);

    // Extract successful image URLs and filter out failed uploads
    const imgUrl = uploadStatus
      .filter((item) => !item.error)
      .map((item) => item.secure_url);

    // If all uploads failed
    if (imgUrl.length === 0) {
      return res.status(500).json({
        message: "Images upload failed",
        success: false,
        errors: uploadStatus.filter((item) => item.error),
      });
    }

    const update = await Products.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        ifFeatured: req.body.ifFeatured,
      },
      {
        new: true,
      }
    );
    if (!update) {
      res.status(404).json({ message: "product not found for update" });
    }
    res.status(200).json({ update });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});


module.exports = router;
