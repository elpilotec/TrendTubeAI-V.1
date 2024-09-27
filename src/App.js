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

const API_URL = process.env.REACT_APP_API_URL || 'https://api.trendtubeai.com';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

async function checkUserPremiumStatus(email) {
  try {
    const response = await fetch(`${API_URL}/api/check-premium-email?email=${encodeURIComponent(email)}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to check premium status');
    }
    const data = await response.json();
    return data.isPremium;
  } catch (error) {
    console.error('Error al verificar el estado premium:', error);
    return false;
  }
}

async function upgradeToPremium(userId) {
  try {
    const response = await fetch(`${API_URL}/api/register-premium-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userId }),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to upgrade to premium');
    }
    return true;
  } catch (error) {
    console.error('Error al actualizar a premium:', error);
    return false;
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
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const theme = darkMode ? darkTheme : lightTheme;

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Inicializando la aplicación...');
        console.log('ID de cliente de Google:', googleClientId);
        if (!googleClientId) {
          throw new Error('Falta el ID de cliente de Google.');
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          const userIsPremium = await checkUserPremiumStatus(parsedUser.email);
          setIsPremium(userIsPremium);
        }
        console.log('Aplicación inicializada con éxito');
      } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        setError('No se pudo inicializar la aplicación. Por favor, intenta recargar la página.');
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
      const userIsPremium = await checkUserPremiumStatus(userData.email);
      setIsPremium(userIsPremium);
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setError('No se pudo iniciar sesión. Por favor, intenta de nuevo.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsPremium(false);
    setShowPremiumSubscription(true);
    localStorage.removeItem('user');
  };

  const handleUpgradeToPremium = async () => {
    setShowStripePayment(true);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setIsLoading(true);
      if (user) {
        const success = await upgradeToPremium(user.email);
        if (success) {
          setIsPremium(true);
          setShowPremiumSubscription(false);
          setShowStripePayment(false);
        } else {
          throw new Error('La actualización a premium falló');
        }
      } else {
        throw new Error('Usuario no ha iniciado sesión');
      }
    } catch (error) {
      console.error('Error al actualizar a premium:', error);
      setError('No se pudo actualizar a premium. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Error en el pago:', error);
    setError('Hubo un error en el proceso de pago. Por favor, intenta de nuevo.');
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
          El ID de cliente de Google no está configurado. Por favor, verifica tus variables de entorno.
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
                    onError={handlePaymentError}
                    onClose={handleCloseStripePayment}
                    apiUrl={`${API_URL}/api/create-payment-intent`}
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