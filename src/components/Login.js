import React, { useState } from 'react';
import { Button, Typography, Box, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Google as GoogleIcon, Close as CloseIcon } from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const navigate = useNavigate(); // Hook para redirigir
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
        onLogin({
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
        });
        navigate('/'); // Redirigir a la página de inicio después del login
      } catch (error) {
        setError('Error durante el inicio de sesión.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      setError('Fallo en el inicio de sesión. Intenta de nuevo.');
    },
    redirectUri: 'https://www.trendtubeai.com',
  });

  const handleCloseError = () => {
    setError(null);
  };

  // Función para manejar el botón de cerrar
  const handleClose = () => {
    navigate('/'); // Redirige a la página de inicio
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, position: 'relative', p: 3, maxWidth: 400, mx: 'auto', backgroundColor: '#121212', borderRadius: 2 }}>
      {/* Botón de cerrar en la esquina superior derecha */}
      <IconButton
        onClick={handleClose} // Redirige al hacer clic
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
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}

