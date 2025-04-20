const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authJwt = require("./helper");
dotenv.config();
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(authJwt());
app.use(bodyParser.json());

// Routes..

app.use("/uploads", express.static("uploads"));
const categoryRoutes = require("./routes/category");
app.use("/api/v1", categoryRoutes);

const subCategory = require("./routes/subCategory");
app.use("/api/v1", subCategory);

const products = require("./routes/products");
app.use("/api/v1", products);

const additionalInfo = require("./routes/additionalInfo");
app.use("/api/v1", additionalInfo);

const user = require("./routes/user");
app.use("/api/v1", user);

mongoose
  .connect(process.env.CONNECTION_STRING, {})
  .then(() => {
    console.log(`DataBase connected to ${process.env.CONNECTION_STRING}`);
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
});
