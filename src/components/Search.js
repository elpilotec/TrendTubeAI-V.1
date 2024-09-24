import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Box, Typography, Snackbar, Paper, 
  useTheme, useMediaQuery, Container, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import YouTubeIcon from '@mui/icons-material/YouTube';

export default function Search() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      if (urlObj.pathname.includes('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1];
      }
      return urlObj.searchParams.get('v');
    } catch (error) {
      console.error('URL inválida:', error);
      return null;
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const videoId = extractVideoId(query);
    if (videoId) {
      setError('');
      setShowSnackbar(true);
      navigate(`/video/${videoId}`);
    } else {
      setError('Por favor, ingresa una URL válida de YouTube o YouTube Shorts.');
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSnackbar(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, #2c2c2c 0%, #1e1e1e 100%)' 
            : 'linear-gradient(145deg, #f0f0f0 0%, #ffffff 100%)'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 2
          }}
        >
          <YouTubeIcon 
            sx={{ 
              fontSize: 48, 
              color: theme.palette.error.main,
              mb: 1
            }} 
          />
          <Typography 
            variant="h4" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#ff6b6b' : '#ff4d4d',
              fontWeight: 'bold',
              fontSize: isMobile ? '1.5rem' : '2rem',
              textAlign: 'center',
              mb: 1
            }}
          >
            Crea Videos Virales Con IA ¡Aquí!
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              textAlign: 'center',
              mb: 2,
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
          >
            Ingresa la URL de un video de YouTube para comenzar
          </Typography>
        </Box>

        <form onSubmit={handleSearch}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: 1
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="URL del video de YouTube o YouTube Shorts"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="error"
              sx={{ 
                minWidth: isMobile ? '100%' : '100px',
                height: '40px'
              }}
            >
              Buscar
            </Button>
          </Box>
        </form>
        {error && (
          <Typography color="error" sx={{ mt: 1, fontSize: '0.875rem' }} align="center">
            {error}
          </Typography>
        )}
      </Paper>
      <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Video encontrado. Redirigiendo...
        </Alert>
      </Snackbar>
    </Container>
  );
}