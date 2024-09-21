import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function Search() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
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
      navigate(`/video/${videoId}`);
    } else {
      setError('Por favor, ingresa una URL válida de YouTube.');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 3, px: 2 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3, 
          color: '#ff6666', 
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.8rem',
          lineHeight: 1.2,
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          margin: '0 auto 24px'
        }}
      >
        Crea Videos Virales Con IA
      </Typography>

      <form onSubmit={handleSearch}>
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ingresa la URL del video de YouTube"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ mr: 1 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Buscar
          </Button>
        </Box>
      </form>
      {error && (
        <Typography color="error" sx={{ mt: 2 }} align="center">
          {error}
        </Typography>
      )}
    </Box>
  );
}