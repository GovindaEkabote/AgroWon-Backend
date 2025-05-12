const { json } = require("body-parser");
const Cart = require("../Models/cart");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const cartList = await Cart.find(req.query);
    if (!cartList) {
      res.status(500).json({ success: false });
    }
    res.status(200).json(cartList);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

router.post("/add", async (req, res) => {
  try {
    let cartList = new Cart({
      productTitle: req.body.productTitle,
      image: req.body.image,
      rating: req.body.rating,
      price: req.body.price,
      quantity: req.body.quantity,
      subTotal: req.body.subTotal,
      productId: req.body.productId,
      userId: req.body.userId,
    });
    if (!cartList) {
      res.status(500).json({
        error: err,
        success: false,
      });
    }
    cartList = await cartList.save();
    res.status(200).json(cartList);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const cartList = await Cart.findById(req.params.id);
    if (!cartList) {
      res.status(404).json({ message: "Product not found" });
    }
    const deleteProduct = await Cart.findByIdAndDelete(req.params.id);
    if (!deleteProduct) {
      res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "product deleted Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

router.put("/:id", async (req, res) => {
  const cartList = await Cart.findByIdAndUpdate(
    req.params.id,
    {
      productTitle: req.body.productTitle,
      image: req.body.image,
      rating: req.body.rating,
      price: req.body.price,
      quantity: req.body.quantity,
      subTotal: req.body.subTotal,
      productId: req.body.productId,
      userId: req.body.userId,
    },
    { new: true }
  );
  if(!cartList){
    return res.status(500).json({
        message:"Cart item cannot be update",
        success:false
    })
  }
  res.send(cartList)
});

module.exports = router;
