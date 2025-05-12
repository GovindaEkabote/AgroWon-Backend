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
    return res.status(200), json(cartList);
  } catch (error) {
    res.status(500), json({ success: false });
  }
});

router.post("/add", async (req, res) => {
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
  return res.status(200), json(cartList);
});



module.exports = router;
