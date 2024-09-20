import React from 'react';
import { AppBar, Toolbar, Typography, Switch, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import logo from '../assets/logo.png'; // Importar el logo

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <AppBar position="static" style={{ backgroundColor: '#ff6666' }}> {/* Color rojo claro */}
      <Toolbar style={{ display: 'flex', alignItems: 'center' }}> {/* Asegurar alineación centrada */}
        {/* Logo y nombre de la app */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ width: '90px', height: '90px', marginRight: '-17px', marginTop: '-10px' }} // Ajuste tamaño y posición del logo
          />
          <Typography variant="h6" style={{ fontSize: '26px', marginTop: '-5px' }}> {/* Ajustar margen del texto */}
            TrendTubeAI
          </Typography>
        </Link>

        <div style={{ flexGrow: 1 }} />

        {/* Modo oscuro */}
        <IconButton
          edge="end"
          color="inherit"
          onClick={toggleDarkMode}
          aria-label="toggle dark mode"
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <Switch
          checked={darkMode}
          onChange={toggleDarkMode}
          color="default"
          inputProps={{ 'aria-label': 'toggle dark mode' }}
        />
        <Typography variant="body2">
          {darkMode ? 'ON' : 'OFF'}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
