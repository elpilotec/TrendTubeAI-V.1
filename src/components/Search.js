import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Search.css'; // Asegúrate de que la ruta es correcta

const Search = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const extractVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    } catch (error) {
      console.error('URL inválida:', error);
      return null;
    }
  };

  const handleSearch = () => {
    const videoId = extractVideoId(query);
    if (videoId) {
      navigate(`/video/${videoId}`);
    } else {
      alert('Por favor, ingresa una URL válida de YouTube.');
    }
  };

  return (
    <div className="search-container">
      

      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ingresa la URL del video de YouTube"
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Buscar
        </button>
      </div>
    </div>
  );
};

export default Search;
