import React, { useState } from 'react';
import { Button, Typography, Box, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Google as GoogleIcon, Close as CloseIcon } from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const PREMIUM_TEST_EMAIL = 'cesarnicolasogando1@gmail.com';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        console.log('Redirect URI being used:', window.location.href);

        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userInfo = await userInfoResponse.json();
        
        // Verificar si el correo es el de prueba premium
        const isPremium = userInfo.email === PREMIUM_TEST_EMAIL;

        // Si es el correo de prueba, hacemos una llamada al servidor para registrarlo como premium
        if (isPremium) {
          const premiumResponse = await fetch('/api/register-premium-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userInfo.email }),
          });

          if (!premiumResponse.ok) {
            console.error('Error al registrar usuario premium:', await premiumResponse.text());
          }
        }

        onLogin({
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          isPremium: isPremium,
        });
        navigate('/');
      } catch (error) {
        console.error('Error during login:', error);
        setError('Failed to log in. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
      setError('Login failed. Please try again.');
    },
    flow: 'implicit',
    redirectUri: 'https://www.trendtubeai.com',
  });

  const handleClose = () => {
    navigate('/');
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(null);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      mt: 4, 
      position: 'relative',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
    }}>
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1,
        }}
        aria-label="Close"
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h6" gutterBottom sx={{ mt: 2, textAlign: 'center' }}>
        Inicia sesión para Acceder a Todas las Funciones
      </Typography>
      <Button
        variant="contained"
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
        onClick={() => login()}
        disabled={isLoading}
        sx={{ 
          mt: 2,
          backgroundColor: '#DB4437',
          '&:hover': {
            backgroundColor: '#C53929',
          },
          '&:disabled': {
            backgroundColor: '#BDBDBD',
          },
        }}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión con Google'}
      </Button>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}