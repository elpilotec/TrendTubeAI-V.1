const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.trendtubeai.com' 
  : 'http://localhost:3001';

export default API_URL;
