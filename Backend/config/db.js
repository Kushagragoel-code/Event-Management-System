const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_management');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB connection error:', error.message);
  }
};

module.exports = connectDB;
