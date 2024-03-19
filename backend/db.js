const mongoose = require("mongoose");
const dotenv = require("dotenv"); 
dotenv.config();

const connect = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.PUBLIC_URL,
      
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with a non-zero status code to indicate an error
  }
};

module.exports = connect;
