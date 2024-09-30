import React, { useState } from 'react';
import { Button, Typography, Box, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Google as GoogleIcon, Close as CloseIcon } from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://www.trendtubeai.com';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userInfo = await userInfoResponse.json();
        
        // Send user info to your backend
        const loginResponse = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email,
          }),
          credentials: 'include',
        });

        if (!loginResponse.ok) {
          throw new Error('Failed to login on server');
        }

        const loginData = await loginResponse.json();

        onLogin(loginData.user);
        navigate('/');
      } catch (error) {
        console.error('Login error:', error);
        setError('Error durante el inicio de sesión. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google login error:', errorResponse);
      setError('Fallo en el inicio de sesión. Intenta de nuevo.');
    },
    redirectUri: `${API_URL}/auth/google/callback`,
  });

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(null);
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, position: 'relative', p: 3, maxWidth: 400, mx: 'auto', backgroundColor: '#121212', borderRadius: 2 }}>
      <IconButton
        onClick={handleClose}
        sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
      
      <Typography variant="h6" align="center" color="white">
        Inicia sesión para acceder a todas las funciones
      </Typography>
      <Button
        variant="contained"
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
        onClick={() => login()}
        disabled={isLoading}
        sx={{ mt: 2, backgroundColor: '#DB4437', color: 'white' }}
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