import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { fetchTrendingVideos } from '../services/YouTubeServices';

const regions = {
  US: 'Estados Unidos',
  ES: 'España',
  DE: 'Alemania',
  JP: 'Japón',
  RU: 'Rusia',
  PR: 'Puerto Rico',
  DO: 'República Dominicana',
  MX: 'México',
  VE: 'Venezuela',
  CO: 'Colombia',
};

const categories = [
  { id: 'all', name: 'General' },
  { id: '10', name: 'Música' },
  { id: '17', name: 'Deportes' },
  { id: '20', name: 'Juegos' },
  { id: '22', name: 'Blogs y Personas' },
  { id: '23', name: 'Comedia' },
  { id: '24', name: 'Entretenimiento' },
  { id: '25', name: 'Noticias y Política' },
  { id: '26', name: 'Educación' },
  { id: '28', name: 'Ciencia y Tecnología' }
];

export default function Trending() {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const getTrendingVideos = async () => {
      setLoading(true);
      try {
        const videos = await fetchTrendingVideos(selectedCategory === 'all' ? '' : selectedCategory, selectedRegion);
        setTrendingVideos(videos);
      } catch (error) {
        console.error('Error fetching trending videos:', error);
      } finally {
        setLoading(false);
      }
    };

    getTrendingVideos();
  }, [selectedRegion, selectedCategory]);

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const formatViewCount = (count) => {
    if (count >= 1000000000) return (count / 1000000000).toFixed(1) + 'B';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Typography variant="h4" component="h1" color="primary.main" fontWeight="bold">
          Descubre los Videos en Tendencia
        </Typography>
      </Box>

      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between"
        gap={2}
        mb={4}
      >
        <FormControl fullWidth>
          <InputLabel id="region-label">Región</InputLabel>
          <Select
            labelId="region-label"
            value={selectedRegion}
            label="Región"
            onChange={handleRegionChange}
          >
            {Object.entries(regions).map(([code, name]) => (
              <MenuItem key={code} value={code}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="category-label">Categoría</InputLabel>
          <Select
            labelId="category-label"
            value={selectedCategory}
            label="Categoría"
            onChange={handleCategoryChange}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography variant="h5" component="h2" gutterBottom>
        Resultados
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : trendingVideos.length > 0 ? (
        <Grid container spacing={3}>
          {trendingVideos.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video.videoId}>
              <Card component={Link} to={`/video/${video.videoId}`} sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={video.thumbnail}
                  alt={video.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom noWrap>
                    {video.title}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatViewCount(video.viewCount)} vistas
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary" align="center">
          No hay videos en tendencia disponibles.
        </Typography>
      )}
    </Container>
  );
}