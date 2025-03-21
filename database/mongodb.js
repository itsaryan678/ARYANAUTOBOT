
const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/aryanautobot";
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
