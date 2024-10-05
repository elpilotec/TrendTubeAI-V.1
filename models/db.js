const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.debug('Intentando conectar a MongoDB...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definido en las variables de entorno');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conexión a MongoDB establecida');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;