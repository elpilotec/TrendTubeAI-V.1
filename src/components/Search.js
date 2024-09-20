import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Search.css';

export default function Search() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      return urlObj.searchParams.get('v');
    } catch (error) {
      console.error('URL inválida:', error);
      return null;
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const videoId = extractVideoId(query);
    if (videoId) {
      setError('');
      navigate(`/video/${videoId}`);
    } else {
      setError('Por favor, ingresa una URL válida de YouTube.');
    }
  };

  return (
    <div className="search-container">
      <h1 className="search-title">
        ¡Tu Inspiración para Crear Videos Virales Con (IA) Comienza Aquí!
      </h1>

      <form onSubmit={handleSearch} className="search-form">
        <label htmlFor="video-url" className="sr-only">URL del video de YouTube</label>
        <input
          id="video-url"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ingresa la URL del video de YouTube"
          className="search-input"
          aria-describedby="url-error"
        />
        <button type="submit" className="search-button">
          Buscar
        </button>
      </form>

      {error && <p id="url-error" className="error-message" role="alert">{error}</p>}
    </div>
  );
}