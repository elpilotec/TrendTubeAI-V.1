// Trending.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrendingVideos } from '../services/YouTubeServices';
import '../styles/Trending.css';
import '../styles/RegionSelector.css';
import CategorySidebar from './CategorySidebar'; // Importamos el nuevo componente

const regions = {
  US: 'Estados Unidos',
  ES: 'España',
  DE: 'Alemania',
  JP: 'Japón',
  RU: 'Rusia',
  DO: 'República Dominicana',
  MX: 'México',
  VE: 'Venezuela',
  CO: 'Colombia',
};

const Trending = () => {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('US');

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

      {/* Reutilizamos el componente CategorySidebar */}
      <CategorySidebar selectedCategory={selectedCategory} handleCategoryChange={handleCategoryChange} />

      {/* Listado de videos */}
      <div className="trending-content">
        <h2>Videos en Tendencia</h2>
        <ul className="video-list">
          {trendingVideos.length > 0 ? (
            trendingVideos.map((video) => (
              <li key={video.videoId} className="video-item">
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
