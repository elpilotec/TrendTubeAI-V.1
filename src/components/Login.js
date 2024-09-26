import React, { useState } from 'react';
import { Button, Typography, Box, IconButton, Snackbar, Alert } from '@mui/material';
import { Google as GoogleIcon, Close as CloseIcon } from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
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
        navigate('/');
      } catch (error) {
        console.error('Error during login:', error);
        setError('Failed to log in. Please try again.');
      }
    },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
      setError('Login failed. Please try again.');
    },
    flow: 'implicit',
  });

  const handleClose = () => {
    navigate('/');
  };

  const handleCloseError = () => {
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
        }}
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h6" gutterBottom>
        Inicia sesión para Acceder a Todas las Funciones
      </Typography>
      <Button
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={() => login()}
        sx={{ 
          mt: 2,
          backgroundColor: '#DB4437',
          '&:hover': {
            backgroundColor: '#C53929',
          },
        }}
      >
        Iniciar sesión con Google
      </Button>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}