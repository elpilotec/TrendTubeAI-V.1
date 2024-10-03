const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.REACT_APP_MONGO_URI; // Cambiado de MONGO_URI a REACT_APP_MONGO_URI
    console.log('MongoDB URI:', MONGO_URI);

    await mongoose.connect(MONGO_URI);

    console.log('MongoDB conectado exitosamente');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1); // Salir del proceso si la conexión falla
  }
};

module.exports = connectDB;