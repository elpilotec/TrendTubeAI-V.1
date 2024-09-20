import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVideoDetails, fetchComments } from '../services/YouTubeServices';
import { generateIdeas } from '../services/ChatGPTServices';
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
      try {
        const details = await fetchVideoDetails(videoId);
        setVideoDetails(details);
        const fetchedComments = await fetchComments(videoId);
        setComments(fetchedComments.slice(0, 10));
      } catch (error) {
        console.error("Error loading video details:", error);
        setErrorMessage("Error al cargar los detalles del video.");
      } finally {
        setLoading(false);
      }
    };
    loadVideoDetails();
  }, [videoId]);

  const handleGenerateIdeas = async () => {
    setLoadingIdeas(true);
    setErrorMessage("");
    setIdeas([]);
    try {
      const result = await generateIdeas(videoDetails);
      console.log("Result from generateIdeas:", result);
      if (result.success) {
        setIdeas(result.ideas);
      } else {
        throw new Error(result.error || "Error desconocido al generar ideas.");
      }
    } catch (error) {
      console.error("Error generating ideas:", error);
      setErrorMessage(error.message || "Error al generar ideas. Por favor, intenta de nuevo.");
    } finally {
      setLoadingIdeas(false);
    }
  };

  const renderIdea = (idea, index) => {
    // Remove hashtags from the script
    const scriptWithoutHashtags = idea.script.replace(/#\w+/g, '').trim();
    
    return (
      <div key={index} className="idea-item">
        <h4>{`Opción # ${index + 1}`}</h4>
        <p><strong>Título:</strong> {idea.title}</p>
        <p><strong>Guión:</strong> {scriptWithoutHashtags}</p>
        <p><strong>Hashtags:</strong> {idea.hashtags.join(' ')}</p>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Cargando detalles del video y comentarios...</div>;
  }

  return (
    <div className="video-details-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        Atrás
      </button>
      <div className="video-details-container">
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
              <button 
                className="generate-ideas-button" 
                onClick={handleGenerateIdeas} 
                disabled={loadingIdeas}
              >
                {loadingIdeas ? 'Generando Ideas...' : 'Generar Ideas Para Video'}
              </button>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {ideas.length > 0 && (
              <div className="ideas-container">
                <h3>Ideas Generadas para Video</h3>
                {ideas.map(renderIdea)}
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