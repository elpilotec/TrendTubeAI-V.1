import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrendingVideos } from '../services/YouTubeServices';
import '../styles/Trending.css';

const regions = {
  US: 'Estados Unidos',
  ES: 'España',
  DE: 'Alemania',
  JP: 'Japón',
  RU: 'Rusia',
  PR: 'Puerto Rico',
  DO: 'República Dominicana',
  MX: 'México',
  VE: 'Venezuela',
  CO: 'Colombia',
};

const categories = [
  { id: 'all', name: 'General' },
  { id: '10', name: 'Música' },
  { id: '17', name: 'Deportes' },
  { id: '20', name: 'Juegos' },
  { id: '22', name: 'Blogs y Personas' },
  { id: '23', name: 'Comedia' },
  { id: '24', name: 'Entretenimiento' },
  { id: '25', name: 'Noticias y Política' },
  { id: '26', name: 'Educación' },
  { id: '28', name: 'Ciencia y Tecnología' }
];

export default function Trending() {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const getTrendingVideos = async () => {
      const videos = await fetchTrendingVideos(selectedCategory === 'all' ? '' : selectedCategory, selectedRegion);
      setTrendingVideos(videos);
    };

    getTrendingVideos();
  }, [selectedRegion, selectedCategory]);

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const formatViewCount = (count) => {
    if (count >= 1000000000) return (count / 1000000000).toFixed(1) + 'B';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <div className="trending-container">
      <h2 className="trending-title">Descubre los Videos en Tendencia</h2>
      <div className="filters-container">
        <div className="select-wrapper">
          <select id="region" value={selectedRegion} onChange={handleRegionChange} className="styled-select">
            {Object.entries(regions).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <label htmlFor="region" className="select-label">Región</label>
        </div>

        <div className="select-wrapper">
          <select id="category" value={selectedCategory} onChange={handleCategoryChange} className="styled-select">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <label htmlFor="category" className="select-label">Categoría</label>
        </div>
      </div>

      <h3 className="results-title">Resultados</h3>

      <div className="trending-content">
        <ul className="video-list">
          {trendingVideos.length > 0 ? (
            trendingVideos.map((video) => (
              <li key={video.videoId} className="video-item">
                <Link to={`/video/${video.videoId}`}>
                  <div className="thumbnail-container">
                    <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                    <div className="view-count">
                      {formatViewCount(video.viewCount)} vistas
                    </div>
                  </div>
                  <h3 className="video-title">{video.title}</h3>
                </Link>
              </li>
            ))
          ) : (
            <p className="no-videos">No hay videos en tendencia disponibles.</p>
          )}
        </ul>
      </div>
    </div>
  );
}