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
import SavedIdeas from './components/SavedIdeas';

// eslint-disable-next-line no-unused-vars
const API_URL = process.env.REACT_APP_API_URL;

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

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

  const checkUserPremiumStatus = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/check-subscription-status?userId=${userId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setIsPremium(data.isPremium);
    } catch (error) {
      console.error('Error al verificar el estado de la suscripción:', error);
      throw error;
    }
  };

  const upgradeToPremium = async (userId) => {
    try {
      // Aquí normalmente harías una llamada a la API para actualizar el estado de la suscripción
      // Por ahora, simularemos una actualización exitosa
      console.log(`Actualizando usuario ${userId} a premium`);
      await checkUserPremiumStatus(userId);
      return true;
    } catch (error) {
      console.error('Error al actualizar a premium:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Inicializando la aplicación...');
        if (!googleClientId) {
          throw new Error('Falta el ID de cliente de Google.');
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          await checkUserPremiumStatus(parsedUser.id);
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

  useEffect(() => {
    if (user) {
      checkUserPremiumStatus(user.id);
    }
  }, [user]);

  const handleLogin = async (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      await checkUserPremiumStatus(userData.id);
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

  const handleUpgradeToPremium = () => {
    setShowStripePayment(true);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setIsLoading(true);
      if (user) {
        const success = await upgradeToPremium(user.id);
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
                    user={user}
                  />
                )}
                {showStripePayment && (
                  <StripePayment
                    amount={500} // Enviar el monto en centavos
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onClose={handleCloseStripePayment}
                    user={user}
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
                  {isPremium && (
                    <Route 
                      path="/saved-ideas" 
                      element={<SavedIdeas user={user} />} 
                    />
                  )}
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