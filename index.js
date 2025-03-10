const express = require("express");
const mongoose = require('mongoose');
const PORT = 4000;
const app = express();
const cors = require("cors");
const states = require("./Controllers/stateName");
app.use(cors());

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/AgroWon_StateDb", {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
