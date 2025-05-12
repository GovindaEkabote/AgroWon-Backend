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





module.exports = router;
