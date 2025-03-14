const subCategory = require("../Models/subCategory");
const express = require("express");
const router = express.Router();

router.post("/add-subcategory", async (req, res) => {
  try {
    const { categoryName, subCategoryName } = req.body;

    // Find category by name
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Create new subcategory
    const newSubCategory = new SubCategory({
      categoryId: category._id,
      subCategoryName
    });

    // Save subcategory
    await newSubCategory.save();

    res.status(201).json({ message: "Subcategory added successfully", subCategory: newSubCategory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
