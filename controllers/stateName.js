const express = require("express");
const IndiaStatesName  = require("../Models/stateModels");
const router = express.Router();

router.post("/states", async (req, res) => {
    try {
      const { states } = req.body; // Expecting `states` to be an array of objects
  
      if (!Array.isArray(states)) {
        return res.status(400).json({
          message: "Invalid data format. 'states' should be an array of objects.",
        });
      }
  
      // Extract names and insert them
      const stateDocs = states.map(state => ({ states: state.name }));
      const result = await IndiaStatesName.insertMany(stateDocs);
  
      res.status(200).json({
        message: "States added successfully",
        result,
      });
    } catch (error) {
      console.error("Error creating states:", error);
      res.status(500).json({
        message: "Error creating states",
        error: error.message || error,
      });
    }
  });
  

router.get("/get", async (req, res) => {
  try {
    const states = await IndiaStatesName.find().select("-_id");
    res.status(200).json({
        states,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error,
    });
  }
});
module.exports = router;
