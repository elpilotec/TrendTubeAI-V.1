import axios from 'axios';

const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;

export const fetchVideoDetails = async (videoId) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,statistics',
        id: videoId,
        key: apiKey,
      },
    });

    console.log('API Response:', response);

    if (response.data && response.data.items.length > 0) {
      const videoData = response.data.items[0].snippet;
      const statistics = response.data.items[0].statistics;

      return {
        title: videoData.title,
        thumbnail: videoData.thumbnails.medium.url,
        viewCount: statistics.viewCount,
      };
    } else {
      throw new Error('No se encontraron detalles del video.');
    }
  } catch (error) {
    console.error('Error al obtener los detalles del video:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchComments = async (videoId) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
      params: {
        part: 'snippet',
        videoId: videoId,
        maxResults: 100,
        key: apiKey,
      },
    });

    if (response.data && response.data.items.length > 0) {
      const comments = response.data.items
        .map((item) => {
          const comment = item.snippet.topLevelComment.snippet;
          return {
            text: comment.textDisplay,
            author: comment.authorDisplayName,
          };
        })
        .slice(0, 10);

      return comments;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error al obtener los comentarios:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchTrendingVideos = async (categoryId = '', regionCode = 'US') => {
  try {
    const params = {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      regionCode: regionCode,
      maxResults: 10,
      key: apiKey,
    };

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
        viewCount: item.statistics.viewCount,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error al obtener videos en tendencia:', error.response?.data || error.message);
    throw error;
  }
};