import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Header from './components/Header';
import Search from './components/Search';
import Trending from './components/Trending';
import VideoDetails from './components/VideoDetails';
import Login from './components/Login';
import PremiumSubscription from './components/PremiumSubscription';
import StripePayment from './components/StripePayment';
import { lightTheme, darkTheme } from './theme';
import { Alert, Snackbar, CircularProgress } from '@mui/material';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// These functions should be implemented to interact with your backend
async function checkUserPremiumStatus(userId) {
  // For now, we'll simulate an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate a 10% chance of the user being premium
      resolve(Math.random() < 0.1);
    }, 1000);
  });
}

async function upgradeToPremium(userId) {
  // For now, we'll simulate an API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a 90% chance of successful upgrade
      if (Math.random() < 0.9) {
        resolve();
      } else {
        reject(new Error('Failed to upgrade to premium'));
      }
    }, 1000);
  });
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumSubscription, setShowPremiumSubscription] = useState(true);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const theme = darkMode ? darkTheme : lightTheme;

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        console.log('Google Client ID:', googleClientId);
        if (!googleClientId) {
          throw new Error('Google Client ID is missing.');
        }

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
  }, [googleClientId]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleLogin = async (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      const userIsPremium = await checkUserPremiumStatus(userData.id);
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

  const handleUpgradeToPremium = async () => {
    setShowStripePayment(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      setIsLoading(true);
      await upgradeToPremium(user.id);
      setIsPremium(true);
      setShowPremiumSubscription(false);
      setShowStripePayment(false);
      localStorage.setItem('isPremium', JSON.stringify(true));
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      setError('Failed to upgrade to premium. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePremiumSubscription = () => {
    setShowPremiumSubscription(false);
  };

  const handleCloseStripePayment = () => {
    setShowStripePayment(false);
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(null);
  };

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
        <Elements stripe={stripePromise}>
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
                {showStripePayment && (
                  <StripePayment
                    amount={5}
                    onSuccess={handlePaymentSuccess}
                    onClose={handleCloseStripePayment}
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
        </Elements>
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