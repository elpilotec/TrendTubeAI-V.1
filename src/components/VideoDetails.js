import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVideoDetails, fetchComments } from '../services/YouTubeServices';
import { generateIdeas } from '../services/ChatGPTServices';
import CategorySidebar from './CategorySidebar';
import '../styles/VideoDetails.css';

export default function VideoDetails() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [videoDetails, setVideoDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formatViewCount = (count) => {
    if (count >= 1000000000) return (count / 1000000000).toFixed(1) + 'B';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  useEffect(() => {
    const loadVideoDetails = async () => {
      const details = await fetchVideoDetails(videoId);
      setVideoDetails(details);
      const fetchedComments = await fetchComments(videoId);
      setComments(fetchedComments.slice(0, 10));
      setLoading(false);
    };
    loadVideoDetails();
  }, [videoId]);

  const handleGenerateIdeas = async () => {
    setLoadingIdeas(true);
    setErrorMessage("");
    const result = await generateIdeas(videoDetails);
    setLoadingIdeas(false);

    if (result.success) {
      console.log('Ideas generadas:', result.ideas);
      setIdeas(result.ideas);
    } else {
      setErrorMessage(result.error);
      console.error(result.error);
    }
  };

  if (loading) {
    return <div>Cargando detalles del video y comentarios...</div>;
  }

  return (
    <div className="video-details-page">
      <CategorySidebar selectedCategory="" handleCategoryChange={() => {}} />
      <div className="video-details-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          Atrás
        </button>
        
        {videoDetails && (
          <>
            <div className="video-header">
              <div className="video-thumbnail-container">
                <img src={videoDetails.thumbnail} alt={videoDetails.title} className="video-thumbnail" />
              </div>
              <div className="video-info-container">
                <p className="video-views">Vistas: {formatViewCount(videoDetails.viewCount)}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="watch-on-youtube-button"
                >
                  Ver en YouTube
                </a>
              </div>
              <h2 className="video-title">{videoDetails.title}</h2>
            </div>

            <div className="button-container">
              <button className="generate-ideas-button" onClick={handleGenerateIdeas} disabled={loadingIdeas}>
                {loadingIdeas ? 'Generando Ideas...' : 'Generar Ideas Para Video'}
              </button>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {ideas.length > 0 && (
              <div className="ideas-container">
                <h3>Ideas Generadas para Video </h3>
                {ideas.map((idea, index) => (
                  <div key={index} className="idea-item">
                    <h4>{`Opción # ${index + 1}`}</h4>
                    <p><strong>Título:</strong> {idea.title || 'Sin título disponible'}</p>
                    <p><strong>Guión:</strong> {idea.script || 'Sin guión disponible'}</p>
                    <p><strong>Hashtags:</strong> {idea.hashtags && idea.hashtags.length > 0 ? idea.hashtags.join(' ') : 'Sin hashtags disponibles'}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="comments-section">
              <h3>Mejores Comentarios</h3>
              <ul className="comments-list">
                {comments.map((comment, index) => (
                  <li key={index} className="comment-item">
                    <p><span className="comment-number">{index + 1}.</span> {comment.author}: {comment.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}