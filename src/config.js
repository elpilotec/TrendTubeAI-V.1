const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.trendtubeai.com/api'  // URL para producción
  : 'http://localhost:3001';           // URL para desarrollo

export default API_URL;

