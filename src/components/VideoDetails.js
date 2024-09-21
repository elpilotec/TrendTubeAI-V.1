import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Paper, Box, List, ListItem, ListItemText, CircularProgress, Snackbar, Container, AppBar, Toolbar, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchVideoDetails, fetchComments } from '../services/YouTubeServices';
import { generarIdeaCorta } from '../services/ChatGPTServices';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
}));

const HighlightedText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.light,
  fontWeight: 'bold',
}));

const ThumbnailContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.9,
  },
}));

const ViewButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: 'rgba(0,0,0,0.6)',
  color: theme.palette.error.light,
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
}));

const SquareBackButton = styled(IconButton)(({ theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
}));

export default function VideoDetails() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [videoDetails, setVideoDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingIdea, setLoadingIdea] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const loadVideoDetails = useCallback(async () => {
    try {
      const details = await fetchVideoDetails(videoId);
      setVideoDetails(details);
      const fetchedComments = await fetchComments(videoId);
      setComments(fetchedComments.slice(0, 10));
    } catch (error) {
      console.error("Error loading video details:", error);
      setErrorMessage("Error al cargar los detalles del video.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    loadVideoDetails();
  }, [loadVideoDetails]);

  const handleGenerateIdea = async () => {
    setLoadingIdea(true);
    setErrorMessage("");
    setIdea(null);
    try {
      const result = await generarIdeaCorta(videoDetails, comments);
      if (result.success) {
        setIdea(result.idea);
      } else {
        throw new Error(result.error || "Error desconocido al generar la idea.");
      }
    } catch (error) {
      console.error("Error generating idea:", error);
      setErrorMessage(error.message || "Error al generar la idea. Por favor, intenta de nuevo.");
      setSnackbarOpen(true);
    } finally {
      setLoadingIdea(false);
    }
  };

  const renderIdea = (idea) => {
    if (!idea) return null;
    return (
      <StyledPaper elevation={3}>
        <Typography variant="h6" gutterBottom>
          {idea.titulo || 'Título no disponible'}
        </Typography>
        <Box mb={2}>
          <HighlightedText variant="subtitle1" gutterBottom>
            Guión:
          </HighlightedText>
          <Typography variant="body2">
            {idea.guion || 'Guión no disponible'}
          </Typography>
        </Box>
        <Box mb={2}>
          <HighlightedText variant="subtitle1" gutterBottom>
            Hashtags:
          </HighlightedText>
          <Typography variant="body2">
            {idea.hashtags && idea.hashtags.length > 0 ? idea.hashtags.join(' ') : 'No hay hashtags disponibles'}
          </Typography>
        </Box>
        <Box>
          <HighlightedText variant="subtitle1" gutterBottom>
            Sugerencias de Producción:
          </HighlightedText>
          {idea.sugerenciasProduccion && idea.sugerenciasProduccion.length > 0 ? (
            <List>
              {idea.sugerenciasProduccion.map((sugerencia, index) => (
                <ListItem key={index}>
                  <ListItemText primary={sugerencia} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2">No hay sugerencias de producción disponibles</Typography>
          )}
        </Box>
      </StyledPaper>
    );
  };

  const formatViewCount = (count) => {
    if (count >= 1000000000) return (count / 1000000000).toFixed(1) + 'B';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar style={{ minHeight: '48px', padding: 0 }}>
          <SquareBackButton color="inherit" onClick={() => navigate(-1)} aria-label="back">
            <ArrowBackIcon />
          </SquareBackButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 3 }}>
        {videoDetails && (
          <>
            <ThumbnailContainer mb={2}>
              <img src={videoDetails.thumbnail} alt={videoDetails.title} style={{ width: '100%', maxHeight: 450, objectFit: 'cover' }} />
              <ViewButton
                variant="text"
                size="small"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
              >
                Ver
              </ViewButton>
              <Box position="absolute" bottom={8} right={8} bgcolor="rgba(0,0,0,0.6)" p={1} borderRadius={1}>
                <Typography variant="body2" color="white">
                  {formatViewCount(videoDetails.viewCount)} vistas
                </Typography>
              </Box>
            </ThumbnailContainer>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 2 }}>
              {videoDetails.title}
            </Typography>
            <Box display="flex" justifyContent="center" mb={2}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleGenerateIdea}
                disabled={loadingIdea}
                sx={{ maxWidth: '300px', width: '100%' }}
              >
                {loadingIdea ? 'Generando Idea...' : 'Generar Idea Para Video'}
              </Button>
            </Box>
            {idea && renderIdea(idea)}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }} align="center">
              Mejores Comentarios
            </Typography>
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={comment.author}
                    secondary={comment.text}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={errorMessage}
        />
      </Container>
    </>
  );
}