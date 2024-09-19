import React from 'react';
import '../styles/Comments.css';

interface Comment {
  author: string;
  text: string;
  likeCount: number;
}

interface CommentsProps {
  comments: Comment[];
}

const Comments: React.FC<CommentsProps> = ({ comments }) => {
  const filterAndSortComments = (comments: Comment[]) => {
    return comments
      .filter(comment => {
        // Filter out short comments and comments with only links
        const isLongEnough = comment.text.length > 20;
        const hasNonLinkContent = !/^https?:\/\/\S+$/.test(comment.text.trim());
        return isLongEnough && hasNonLinkContent;
      })
      .sort((a, b) => b.likeCount - a.likeCount) // Sort by like count
      .slice(0, 10); // Get top 10 comments
  };

  const relevantComments = filterAndSortComments(comments);

  if (relevantComments.length === 0) {
    return <p>No hay comentarios relevantes disponibles.</p>;
  }

  return (
    <div className="comments-container">
      <h2 className="comments-title">Mejores Comentarios</h2>
      <ul className="comments-list">
        {relevantComments.map((comment, index) => (
          <li key={index} className="comment-item">
            <div className="comment-header">
              <span className="comment-number">{index + 1}.</span>
              <span className="comment-author">@{comment.author}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
            <div className="comment-footer">
              <span className="comment-likes">{comment.likeCount} likes</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Comments;