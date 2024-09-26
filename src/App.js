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
import { Alert, Snackbar } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Alert severity="error">
            Something went wrong. Please try refreshing the page or contact support if the problem persists.
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumSubscription, setShowPremiumSubscription] = useState(true);
  const [error, setError] = useState(null);
  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedIsPremium = localStorage.getItem('isPremium');
      if (storedIsPremium) {
        setIsPremium(JSON.parse(storedIsPremium));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data. Please try logging in again.');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleLogin = (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Here you should verify if the user is premium
      const userIsPremium = false; // This should come from your backend
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
      console.log('Usuario actualizado a Premium');
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

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
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
          <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
            <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;