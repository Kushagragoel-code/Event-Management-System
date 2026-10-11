const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/event_management");
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("db connection me error:", err);
  }
};

module.exports = connectDB;
