import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Asegúrate de tener este import
import { fetchTrendingVideos } from '../services/YouTubeServices';
import '../styles/Trending.css';
import '../styles/RegionSelector.css';
const categories = {
  10: 'Música',
  17: 'Deportes',
  20: 'Juegos',
  22: 'Blogs y Personas',
  23: 'Comedia',
  24: 'Entretenimiento',
  25: 'Noticias y Política',
  26: 'Educación',
  28: 'Ciencia y Tecnología',
};

const regions = {
  US: 'Estados Unidos',
  ES: 'España',
  DO: 'República Dominicana',
};

const Trending = () => {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('US'); // Estado para la región seleccionada

  useEffect(() => {
    const getTrendingVideos = async () => {
      const videos = await fetchTrendingVideos(selectedCategory, selectedRegion);
      setTrendingVideos(videos);
    };

    getTrendingVideos();
  }, [selectedCategory, selectedRegion]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === 'all' ? '' : categoryId);
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  return (
    <div className="trending-container">
      {/* Selector de región */}
      <div className="region-selector">
        <label htmlFor="region">Selecciona la Región: </label>
        <select id="region" value={selectedRegion} onChange={handleRegionChange}>
          {Object.keys(regions).map((regionCode) => (
            <option key={regionCode} value={regionCode}>
              {regions[regionCode]}
            </option>
          ))}
        </select>
      </div>

      {/* Barra de categorías vertical */}
      <div className="trending-sidebar">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`trending-category ${!selectedCategory ? 'active' : ''}`}
        >
          Todos
        </button>
        {Object.keys(categories).map((categoryId) => (
          <button
            key={categoryId}
            onClick={() => handleCategoryChange(categoryId)}
            className={`trending-category ${selectedCategory === categoryId ? 'active' : ''}`}
          >
            {categories[categoryId]}
          </button>
        ))}
      </div>

      {/* Listado de videos */}
      <div className="trending-content">
        <h2>Videos en Tendencia</h2>
        <ul className="video-list">
          {trendingVideos.length > 0 ? (
            trendingVideos.map((video) => (
              <li key={video.videoId} className="video-item">
                {/* Añadir `Link` alrededor del título o imagen para navegación interna */}
                <Link to={`/video/${video.videoId}`}>
                  <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                  <h3 className="video-title">{video.title}</h3>
                </Link>
              </li>
            ))
          ) : (
            <p>No hay videos en tendencia disponibles.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Trending;
