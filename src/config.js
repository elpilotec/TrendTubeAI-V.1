// Elimina esta línea, ya que las variables de entorno se cargan en server.js
// require('dotenv').config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
};

