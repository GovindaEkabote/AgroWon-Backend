const express = require("express");
const mongoose = require('mongoose');
const PORT = 4001;
const app = express();
const cors = require("cors");
const states = require("./Controllers/stateName");
const product = require('./routes/products')
const category = require('./routes/category')
const subCategory = require('./routes/subCategory')
const User = require('./routes/user')
const Cart = require('./routes/cart')
app.use(cors());

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/AgroWon", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

app.use("/api", states);
app.use('/api/v1',product)
app.use('/api/v1',category)
app.use('/api/v1',subCategory)
app.use('/api/v1',User)
app.use('/api/v1',Cart)
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
