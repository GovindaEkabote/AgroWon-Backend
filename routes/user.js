const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../Models/user");
const pLimit = require("p-limit");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.post("/signup-ecom", async (req, res) => {
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
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
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

    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.TOKEN,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({ success: true, result, token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await User.create({
      name,
      email,
      password: hashPassword,
    });

    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.TOKEN,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({ success: true, result, token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res.status(404).json({ message: "Invalid Email and Password" });
    }
    const comparePassword = await bcrypt.compare(password, existUser.password);
    if (!comparePassword) {
      return res.status(404).json({ message: "Invalid Email and Password" });
    }
    const token = jwt.sign(
        { email: existUser.email, id: existUser._id },
        process.env.TOKEN,
        { expiresIn: "7d" }
      );
    res.status(200).json({ success: true, existUser, token,message:"Login Successful" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

router.get('/user/:id',async(req,res) =>{
  const user = await User.findById(req.params.id)
  if(!user){
    return res.status(404).json({message:"User Not Found"})
  }
  res.status(200).json({
    user
  })
})

router.get('/users',async(req,res) =>{
  const users = await User.find();
  if (!users) {
    return res.status(400).json({
      message: "User Not Found",
    });
  }
  res.status(200).json({
    users
  })
})

router.put('/update-user/:id',async(req,res) =>{
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new:true
    }
  )
  res.status(200).json({
    message:"User Updated Successfully",
    user
})
})

router.delete('/delete-user/:id',async(req,res) =>{
  const user = await User.findByIdAndDelete(req.params.id);
  if(!user)
    {
        return res.status(404).json({
            message:"User Not Found",
        })
    }
    res.status(200).json({
        message:"User Deleted Successfully",
    })
})

router.post('/logout' ,(req,res) =>{
  res.clearCookie('token'); // make sure 'token' matches your cookie name
res.status(200).json({ message: 'Logout successful' });
})

module.exports = router;
