const express = require("express");
const Products = require("../models/products");
const Category = require("../models/category");
const cloudinary = require("../config/cloudinary");
const pLimit = require("p-limit");
const fs = require("fs");
const router = express.Router();

router.get("/get-product", async (req, res) => {
  try {
    const { 
      page = 1,
      perPage = 8,
      all, 
      category, // Category name
      sortBy = "category",
      sortOrder = "asc"
    } = req.query;

    const currentPage = Math.max(1, parseInt(page));
    const itemsPerPage = Math.max(1, parseInt(perPage));

    // Build base query
    const query = {};

    // If category is provided, find the corresponding category _id
    if (category) {
      const categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, "i") } });

      if (!categoryDoc) {
        return res.status(404).json({ 
          success: false,
          message: "Category not found" 
        });
      }
      
      query["category"] = categoryDoc._id; // Use _id instead of name
    }

    // Count total matching products
    const totalPosts = await Products.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / itemsPerPage);

    if (currentPage > totalPages && totalPages > 0) {
      return res.status(404).json({ 
        success: false,
        message: "Page not found" 
      });
    }

    if (all === "true") {
      const products = await Products.find(query).populate("category").exec();
      return res.json({ success: true, products, totalPosts });
    }

    // Sorting options
    const sortOptions = {};
    if (sortBy === "category") sortOptions["category"] = sortOrder === "asc" ? 1 : -1;
    else if (sortBy === "price") sortOptions.price = sortOrder === "asc" ? 1 : -1;
    else if (sortBy === "rating") sortOptions.rating = sortOrder === "asc" ? 1 : -1;
    else if (sortBy === "date") sortOptions.dateCreated = sortOrder === "asc" ? 1 : -1;

    // Fetch products
    const products = await Products.find(query)
      .populate("category")
      .sort(sortOptions)
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    if (!products.length) {
      return res.status(404).json({ 
        success: false,
        message: "No products found matching your criteria"
      });
    }

    res.status(200).json({
      success: true,
      products,
      totalPages,
      currentPage,
      itemsPerPage,
      totalPosts,
      sortBy,
      sortOrder,
      ...(category && { filteredCategory: category })
    });

  } catch (error) {
    console.error("Error in /get-product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

router.get("/feature", async (req, res) => {
  const productList = await Products.find({ isFeatured: true });
  if (!productList) {
    res.status(500).json({ success: false });
  }
  return res.status(200).json(productList);
});

router.post("/create-product", async (req, res) => {
  try {
    // Check if category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({ message: "Invalid Category!" });
    }

    // Validate images array
    if (
      !req.body.images ||
      !Array.isArray(req.body.images) ||
      req.body.images.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid images array",
        success: false,
      });
    }

    // Upload images concurrently (max 2 at a time)
    const limit = pLimit(2);
    const imagesToUpload = req.body.images.map((image) =>
      limit(async () => {
        try {
          const result = await cloudinary.uploader.upload(image);
          return { public_id: result.public_id, url: result.secure_url };
        } catch (error) {
          return { error: error.message };
        }
      })
    );

    const uploadResults = await Promise.all(imagesToUpload);

    // Extract successful image uploads
    const uploadedImages = uploadResults.filter((img) => !img.error);

    // If no images uploaded successfully
    if (uploadedImages.length === 0) {
      return res.status(500).json({
        message: "Image upload failed",
        success: false,
        errors: uploadResults.filter((img) => img.error),
      });
    }

    // Create and save new product
    const product = new Products({
      name: req.body.name,
      description: req.body.description,
      images: uploadedImages, // Store images correctly
      brand: req.body.brand,
      price: req.body.price,
      oldPrice: req.body.oldPrice || 0, // Default if not provided
      discount: req.body.discount || 0,
      category: req.body.category,
      subCategory: req.body.subCategory, // Added subCategory
      countInStock: req.body.countInStock,
      weight: req.body.weight || [], // Default to empty array
      quantity: req.body.quantity || [],
      rating: req.body.rating || 0,
      isFeatured: req.body.isFeatured || false, // Fixed naming issue

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

    await product.save();

    return res.status(201).json({
      message: "Product added successfully",
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
    const deleteProduct = await Products.findById(req.params.id);
    if (!deleteProduct) {
      return res.status(401).json({ message: "Product Not Found" });
    }

    const deleteImages = deleteProduct.images;

    if (deleteImages.length > 0) {
      for (const image of deleteImages) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (error) {
          console.error(`Failed to delete image ${image.public_id}:`, error);
        }
      }
    }
    await Products.findByIdAndDelete(req.params.id);

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
    const update = await Products.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        brand: req.body.brand,
        price: req.body.price,
        countInStock: req.body.countInStock,
        ifFeatured: req.body.ifFeatured,
        subCategory: req.body.subCategory,
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

router.get("/products/category/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Find products by category ID
    const products = await Products.find({ category: categoryId }).populate("category");

    if (!products.length) {
      return res.status(404).json({ success: false, message: "No products found for this category" });
    }

    res.status(200).json({ success: true, category: category.name, products });
  } catch (error) {
    console.error("Error fetching products by category ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});


module.exports = router;
