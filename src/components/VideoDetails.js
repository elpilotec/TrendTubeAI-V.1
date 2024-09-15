import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchVideoDetails, fetchComments } from '../services/YouTubeServices';
import { generateIdeas } from '../services/ChatGPTServices';
import '../styles/VideoDetails.css'; // Asegúrate de tener este archivo de estilos

const VideoDetails = () => {
  const { videoId } = useParams();
  const [videoDetails, setVideoDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [ideas, setIdeas] = useState([]); // Estado para almacenar las ideas generadas
  const [loading, setLoading] = useState(true);
  const [loadingIdeas, setLoadingIdeas] = useState(false); // Estado para mostrar el spinner mientras se generan las ideas

  useEffect(() => {
    const loadVideoDetails = async () => {
      const details = await fetchVideoDetails(videoId);
      setVideoDetails(details);

      const fetchedComments = await fetchComments(videoId);
      const sortedComments = fetchedComments.sort((a, b) => b.likeCount - a.likeCount);
      setComments(sortedComments.slice(0, 12));

      setLoading(false);
    };
    loadVideoDetails();
  }, [videoId]);

  const handleGenerateIdeas = async () => {
    setLoadingIdeas(true); // Activar el loading mientras se generan las ideas
    const result = await generateIdeas(comments);
    setLoadingIdeas(false); // Desactivar el loading

    if (result.success) {
      setIdeas(result.ideas); // Actualizar las ideas en el estado
    } else {
      console.error(result.error);
    }
  };

  if (loading) {
    return <div>Cargando detalles del video y comentarios...</div>;
  }

  return (
    <div className="video-details-container">
      {videoDetails && (
        <>
          <div className="video-header">
            {/* Colocamos la miniatura arriba y el título debajo */}
            <img src={videoDetails.thumbnail} alt={videoDetails.title} className="video-thumbnail" />
            <h2 className="video-title">{videoDetails.title}</h2>
          </div>

          <div className="button-container">
            <button className="generate-ideas-button" onClick={handleGenerateIdeas} disabled={loadingIdeas}>
              {loadingIdeas ? 'Generando Ideas...' : 'Generar Ideas'}
            </button>
          </div>

          {/* Mostrar las ideas generadas */}
          {ideas.length > 0 && (
            <div className="ideas-container">
              <h3>Ideas Generadas</h3>
              <ul className="ideas-list">
                {ideas.map((idea, index) => (
                  <li key={index} className="idea-item">
                    {idea}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="comments-section">
            <h3>Mejores Comentarios</h3>
            <ul className="comments-list">
              {comments.map((comment, index) => (
                <li key={index} className="comment-item">
                  <p><span className="comment-number">{index + 1}.</span> {comment.author}: {comment.text}</p>
                  <p>Likes: {comment.likeCount}</p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoDetails;