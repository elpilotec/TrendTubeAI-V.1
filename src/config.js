const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://trendtubeai.com' // Reemplaza esto con la URL real de tu API en producción
  : 'http://localhost:3001'; // Asegúrate de que este puerto coincida con el de tu servidor de desarrollo

export default API_URL;
