const express = require("express");
const router = express.Router();
const Cart = require("../Models/cart"); 

// GET all cart items (with optional filters via query)
router.get("/cart", async (req, res) => {
  try {
    const cartList = await Cart.find(req.query);
    if (!cartList || cartList.length === 0) {
      return res.status(404).json({ success: false, message: "Cart is empty" });
    }
    res.status(200).json(cartList);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

// POST /cart/add
router.post("/cart/add", async (req, res) => {
  try {
    const newCartItem = new Cart({ ...req.body });
    const savedItem = await newCartItem.save();
    res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: savedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
});


// PUT update cart item by ID
router.put("/cart/:id", async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

// DELETE cart item by ID
router.delete("/cart/:id", async (req, res) => {
  try {
    const deleted = await Cart.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

module.exports = router;
