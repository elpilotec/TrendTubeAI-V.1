const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.trendtubeai.com'  // URL para producción
  : 'http://localhost:3001';        // URL para desarrollo (asegúrate que coincida con el puerto de tu servidor local)

export default API_URL;

