import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Trending.css';

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

const CategorySidebar = ({ selectedCategory, handleCategoryChange }) => {
  const navigate = useNavigate();

  return (
    <div className="trending-sidebar">
      <h2 className="trending-header">Tendencias</h2>
      <button
        onClick={() => {
          handleCategoryChange('all');
          navigate('/'); // Regresa a la página de tendencias generales
        }}
        className={`trending-category ${!selectedCategory ? 'active' : ''}`}
      >
        General
      </button>
      {Object.keys(categories).map((categoryId) => (
        <button
          key={categoryId}
          onClick={() => {
            handleCategoryChange(categoryId);
            navigate(`/?category=${categoryId}`); // Navega a la página de tendencias por categoría
          }}
          className={`trending-category ${selectedCategory === categoryId ? 'active' : ''}`}
        >
          {categories[categoryId]}
        </button>
      ))}
    </div>
  );
};

export default CategorySidebar;

