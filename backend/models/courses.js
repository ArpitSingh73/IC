const mongoose = require("mongoose");
const { Schema } = mongoose;

const coursesSchema = new Schema({
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
});

const courses = mongoose.model("Courses", coursesSchema);
module.exports = courses;
