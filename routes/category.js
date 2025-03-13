const Category = require("../models/category");
const cloudinary = require("../config/cloudinary");
const express = require("express");
const pLimit = require("p-limit");
const router = express.Router();

router.post("/create", async (req, res) => {
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

    // Create a new category with uploaded images
    const category = new Category({
      name: req.body.name,
      images: imgUrl,
      color: req.body.color,
    });

    await category.save(); // Save to DB

    res.status(201).json({
      message: "Category created successfully",
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});

router.get("/get-category", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 6;
    const totalPosts = await Category.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    if (page > totalPages) {
      return res.status(404).json({ message: "Page Not Found" });
    }

    const categoryList = await Category.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!categoryList || categoryList == 0) {
      return res.status(401).json({ message: "Product Categories Not Found" });
    }
    res.status(200).json({
      "categoryList": categoryList,
      "totalPages": totalPages,
      "page": page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/get-category/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ message: "Product category not found", success: false });
    }
    res.status(200).json({
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});

router.delete("/delete-categories/:id", async (req, res) => {
  try {
    const categories = await Category.findByIdAndDelete(req.params.id);
    if (!categories) {
      return res.status(404).json({ message: "Product categories not found" });
    }
    res.status(200).json({ message: "category deleted successfuly.." });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});

router.put("/update-caterory/:id", async (req, res) => {
  try {
    const update = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!update) {
      return res.status(404).json({ message: "category not found" });
    }
    res.status(200).json({ message: "category update successfully", update });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
