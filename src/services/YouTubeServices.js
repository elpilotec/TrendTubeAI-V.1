import axios from 'axios';

// Obtener la clave API de YouTube desde las variables de entorno
const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;

// Función para obtener los detalles del video, incluyendo el número de visitas
export const fetchVideoDetails = async (videoId) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,statistics', // Añadimos 'statistics' para obtener el número de visitas
        id: videoId,
        key: apiKey,
      },
    });

    if (response.data && response.data.items.length > 0) {
      const videoData = response.data.items[0].snippet;
      const statistics = response.data.items[0].statistics; // Obtener estadísticas (número de visitas)

      return {
        title: videoData.title,
        thumbnail: videoData.thumbnails.medium.url,
        viewCount: statistics.viewCount, // Número de visitas del video
      };
    } else {
      console.error('No se encontraron detalles del video.');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener los detalles del video:', error.response?.data || error.message);
    return null;
  }
};

// Función para obtener los comentarios de un video
export const fetchComments = async (videoId) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
      params: {
        part: 'snippet',
        videoId: videoId,
        maxResults: 100, // Puedes aumentar el número si es necesario
        key: apiKey,
      },
    });

    if (response.data && response.data.items.length > 0) {
      // Obtener los primeros 12 comentarios sin ordenar ni mostrar likes
      const comments = response.data.items
        .map((item) => {
          const comment = item.snippet.topLevelComment.snippet;
          return {
            text: comment.textDisplay,
            author: comment.authorDisplayName,
          };
        })
        .slice(0, 12); // Limitar a los primeros 12 comentarios

      return comments;
    } else {
      console.error('No se encontraron comentarios.');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener los comentarios:', error.response?.data || error.message);
    return [];
  }
};

// Función para obtener los videos en tendencia filtrados por categoría y región
export const fetchTrendingVideos = async (categoryId = '', regionCode = 'US') => { // Aquí agregamos la región por defecto
  try {
    const params = {
      part: 'snippet,contentDetails,statistics', // Añadimos 'statistics' para obtener las visitas
      chart: 'mostPopular',
      regionCode: regionCode, // Usamos la región seleccionada
      maxResults: 10,
      key: apiKey,
    };

    // Si hay una categoría seleccionada, añadir el filtro de categoría
    if (categoryId) {
      params.videoCategoryId = categoryId;
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', { params });

    if (response.data && response.data.items.length > 0) {
      return response.data.items.map((item) => ({
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        videoId: item.id,
        categoryId: item.snippet.categoryId,
        viewCount: item.statistics.viewCount, // Añadir el número de visitas en el objeto de retorno
      }));
    } else {
      console.error('No se encontraron videos en tendencia.');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener videos en tendencia:', error.response?.data || error.message);
    return [];
  }
};