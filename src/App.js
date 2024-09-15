import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import Header from './components/Header';
import Search from './components/Search';
import Trending from './components/Trending';
import VideoDetails from './components/VideoDetails';
import './styles/App.css'; // Asegúrate de importar correctamente los estilos

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Router>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        {/* Barra superior fija */}
        <header className="header-container">
          <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        </header>
        
        {/* Barra lateral y contenido principal */}
        <div className="trending-sidebar">
          <Trending />
        </div>

        <div className="page-content">
          {/* Eslogan */}
          <h2 className="slogan">
            ¡Enciende tu creatividad con ideas de video impulsadas por IA!
          </h2>

          {/* Barra de búsqueda */}
          <Search />

          {/* Rutas de la aplicación */}
          <Routes>
            <Route path="/" element={<Trending />} />
            <Route path="/video/:videoId" element={<VideoDetails />} />
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
