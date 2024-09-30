const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI; // Mantenemos REACT_APP_MONGO_URI
    console.log('MongoDB URI:', MONGO_URI);

    // Conexión con las opciones recomendadas
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB conectado exitosamente');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1); // Salir del proceso si la conexión falla
  }
};

module.exports = connectDB;