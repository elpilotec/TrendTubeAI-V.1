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

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  console.log('Google Client ID:', googleClientId); // Log the client ID for debugging

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const storedIsPremium = localStorage.getItem('isPremium');
        if (storedIsPremium) {
          setIsPremium(JSON.parse(storedIsPremium));
        }
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Failed to initialize app. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!googleClientId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">
          Google Client ID is not set. Please check your environment variables.
        </Alert>
      </Box>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header 
              darkMode={darkMode} 
              toggleDarkMode={() => setDarkMode(!darkMode)} 
              user={user}
              onLogout={() => {
                setUser(null);
                setIsPremium(false);
                localStorage.removeItem('user');
                localStorage.removeItem('isPremium');
              }}
              isPremium={isPremium}
            />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              {!user && <Login onLogin={(userData) => {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
              }} />}
              {user && !isPremium && showPremiumSubscription && (
                <PremiumSubscription 
                  onUpgrade={() => {
                    setIsPremium(true);
                    setShowPremiumSubscription(false);
                    localStorage.setItem('isPremium', 'true');
                  }}
                  onClose={() => setShowPremiumSubscription(false)}
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
                      onUpgradeToPremium={() => {
                        setIsPremium(true);
                        localStorage.setItem('isPremium', 'true');
                      }}
                    />
                  } 
                />
              </Routes>
            </Box>
          </Box>
        </Router>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;