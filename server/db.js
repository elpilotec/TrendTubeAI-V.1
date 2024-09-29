const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const REACT_APP_mongoURI = process.env.REACT_APP_MONGO_URI; // Leer la URI desde el .env
    console.log('MongoDB URI:', REACT_APP_mongoURI);
    await mongoose.connect(REACT_APP_mongoURI); // Conectar a MongoDB
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
