import React, { useState } from 'react';
import { Button, Typography, IconButton, Snackbar, Alert, CircularProgress, Paper } from '@mui/material';
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
    onError: () => {
      setError('Fallo en el inicio de sesión. Intenta de nuevo.');
    },
    redirectUri: 'https://www.trendtubeai.com',
  });

  const handleCloseError = () => setError(null);
  const handleClose = () => navigate('/'); // Redirige a la página de inicio

  return (
    <Paper elevation={3} sx={{
      maxWidth: 320,
      mx: 'auto',
      mt: 4,
      p: 3,
      position: 'relative',
      borderRadius: 2,
      textAlign: 'center',
    }}>
      {/* Botón de cerrar en la esquina superior derecha */}
      <IconButton
        onClick={handleClose} // Redirige al hacer clic
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'text.secondary',
        }}
        aria-label="close"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      
      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 1 }}>
        Iniciar sesión
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Accede a todas las funciones de TrendTube AI
      </Typography>
      
      <Button
        variant="contained"
        fullWidth
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
        onClick={() => login()}
        disabled={isLoading}
        sx={{
          mt: 1,
          backgroundColor: '#DB4437',
          color: 'white',
          '&:hover': {
            backgroundColor: '#C23321',
          },
          py: 1,
          textTransform: 'none',
          borderRadius: 2,
        }}
      >
        {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
      </Button>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
