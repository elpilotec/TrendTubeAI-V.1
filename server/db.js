const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = 'mongodb+srv://cesarnicolasogando1:Nicolas-0618@clutertrendtube.1aqq9.mongodb.net/?retryWrites=true&w=majority&appName=clutertrendtube';
    console.log('MongoDB URI:', mongoURI);
    await mongoose.connect(mongoURI); // Elimina las opciones obsoletas
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
