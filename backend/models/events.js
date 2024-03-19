const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventSchema = new Schema({
  
  name: {
    type: String,
    required: true,
  },
  teacher: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  students: {
    type: [String],
  },
  registerDate: {
    type: String,
    required: true,
  },
});

const events = mongoose.model("Events", eventSchema);
module.exports = events;
