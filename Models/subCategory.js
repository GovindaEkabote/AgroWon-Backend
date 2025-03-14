const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  subCategoryName: {
    type: String,
    required: true
  }
});

const SubCategory = mongoose.model("SubCategory", subCategorySchema);
module.exports = SubCategory;
