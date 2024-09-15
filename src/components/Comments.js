import React from 'react';
import '../styles/Comments.css'; // Si tienes estilos personalizados

const Comments = ({ comments }) => {
  return (
    <div className="comments-container">
      <h2>Mejores Comentarios</h2>
      <ul>
        {comments.map((comment, index) => (
          <li key={index} className="comment-item">
            {/* Número del comentario */}
            <p>
              <strong>Comentario {index + 1}:</strong>
            </p>
            {/* Autor */}
            <p>
              <strong>Autor:</strong> {comment.author}
            </p>
            {/* Texto del comentario */}
            <p>{comment.text}</p>
            {/* Likes del comentario */}
            <p>Likes: {comment.likeCount}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Comments;
