import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from './components/Header';
import Search from './components/Search';
import Trending from './components/Trending';
import VideoDetails from './components/VideoDetails';
import Login from './components/Login';
import PremiumSubscription from './components/PremiumSubscription';
import { lightTheme, darkTheme } from './theme';
import { Alert, Snackbar, CircularProgress } from '@mui/material';

function App() {
  // Manejo del estado de modo oscuro, usuario y premium
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumSubscription, setShowPremiumSubscription] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const theme = darkMode ? darkTheme : lightTheme;

  // Leer el Google Client ID desde las variables de entorno
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Efecto para inicializar la aplicación
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Google Client ID:', googleClientId);
        if (!googleClientId) {
          throw new Error('Google Client ID is missing.');
        }

        // Recuperar el usuario y el estado premium del localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const storedIsPremium = localStorage.getItem('isPremium');
        if (storedIsPremium) {
          setIsPremium(JSON.parse(storedIsPremium));
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Failed to initialize app. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [googleClientId]);

  // Efecto para actualizar el modo oscuro en localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Manejo de eventos de login, logout y suscripción premium
  const handleLogin = (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      const userIsPremium = false; // Este valor debería venir del backend
      setIsPremium(userIsPremium);
      localStorage.setItem('isPremium', JSON.stringify(userIsPremium));
    } catch (error) {
      console.error('Error during login:', error);
      setError('Failed to log in. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsPremium(false);
    setShowPremiumSubscription(true);
    localStorage.removeItem('user');
    localStorage.removeItem('isPremium');
  };

  const handleUpgradeToPremium = () => {
    try {
      setIsPremium(true);
      setShowPremiumSubscription(false);
      localStorage.setItem('isPremium', JSON.stringify(true));
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      setError('Failed to upgrade to premium. Please try again.');
    }
  };

  const handleClosePremiumSubscription = () => {
    setShowPremiumSubscription(false);
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Si la aplicación está cargando, mostrar un spinner
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si no hay Google Client ID, mostrar un mensaje de error
  if (!googleClientId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">
          Google Client ID is not set. Please check your environment variables.
        </Alert>
      </Box>
    );
  }

  // Si todo está bien, mostrar la aplicación envuelta en el GoogleOAuthProvider
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header 
              darkMode={darkMode} 
              toggleDarkMode={() => setDarkMode(prevMode => !prevMode)} 
              user={user}
              onLogout={handleLogout}
              isPremium={isPremium}
            />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              {!user && <Login onLogin={handleLogin} />}
              {user && !isPremium && showPremiumSubscription && (
                <PremiumSubscription 
                  onUpgrade={handleUpgradeToPremium}
                  onClose={handleClosePremiumSubscription}
                />
              )}
              <Routes>
                <Route path="/" element={
                  <>
                    <Search />
                    <Trending />
                  </>
                } />
                <Route 
                  path="/video/:videoId" 
                  element={
                    <VideoDetails 
                      user={user} 
                      isPremium={isPremium} 
                      onUpgradeToPremium={handleUpgradeToPremium}
                    />
                  } 
                />
              </Routes>
            </Box>
          </Box>
        </Router>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
