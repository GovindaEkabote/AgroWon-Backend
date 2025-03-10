const mongoose = require('mongoose');

const stateName = new mongoose.Schema({
  states: {
    type: String,
    required: true, // Field is required
  },
});

const IndiaStatesName = mongoose.model('State', stateName); // Ensure collection name is singular
module.exports = IndiaStatesName;
