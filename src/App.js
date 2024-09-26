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

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumSubscription, setShowPremiumSubscription] = useState(true);
  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedIsPremium = localStorage.getItem('isPremium');
    if (storedIsPremium) {
      setIsPremium(JSON.parse(storedIsPremium));
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Aquí podrías verificar si el usuario es premium
    const userIsPremium = false; // Esto debería venir de tu backend
    setIsPremium(userIsPremium);
    localStorage.setItem('isPremium', JSON.stringify(userIsPremium));
  };

  const handleLogout = () => {
    setUser(null);
    setIsPremium(false);
    setShowPremiumSubscription(true);
    localStorage.removeItem('user');
    localStorage.removeItem('isPremium');
  };

  const handleUpgradeToPremium = () => {
    setIsPremium(true);
    setShowPremiumSubscription(false);
    localStorage.setItem('isPremium', JSON.stringify(true));
    console.log('Usuario actualizado a Premium');
  };

  const handleClosePremiumSubscription = () => {
    setShowPremiumSubscription(false);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header 
              darkMode={darkMode} 
              toggleDarkMode={toggleDarkMode} 
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
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;