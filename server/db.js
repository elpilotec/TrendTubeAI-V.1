const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    console.log('MongoDB URI:', MONGO_URI);

    if (!MONGO_URI) {
      throw new Error('MONGO_URI no está definido en las variables de entorno');
    }

    await mongoose.connect(MONGO_URI);

    console.log('MongoDB conectado exitosamente');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;