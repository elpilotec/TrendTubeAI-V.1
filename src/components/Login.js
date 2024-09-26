import React from 'react';
import { Button, Typography, Box, IconButton } from '@mui/material';
import { Google as GoogleIcon, Close as CloseIcon } from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      // Aquí deberías hacer una llamada a tu backend para verificar el token
      // y obtener la información del usuario
      onLogin({ id: 'user_id', name: 'User Name' });
    },
  });

  const handleClose = () => {
    navigate('/');
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
    </Box>
  );
}