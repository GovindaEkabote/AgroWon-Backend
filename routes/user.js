const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../Models/user");
const pLimit = require("p-limit");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, password, profile } = req.body;

    if (!name || !phone || !email || !password || !profile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const limit = pLimit(1);
    const imagesToUpload = profile.map((image) =>
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
    const uploadedImages = uploadResults.filter((img) => !img.error);

    if (uploadedImages.length === 0) {
      return res.status(500).json({
        message: "Image upload failed",
        success: false,
        errors: uploadResults.filter((img) => img.error),
      });
    }

    const result = await User.create({
      name,
      phone,
      email,
      password: hashPassword,
      profile: uploadedImages,
    });

    res.status(201).json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

module.exports = router;
