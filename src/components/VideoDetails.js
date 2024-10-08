import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Typography, Button, Paper, Box, List, ListItem, ListItemText, CircularProgress, 
  Snackbar, Container, AppBar, Toolbar, IconButton, useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { fetchVideoDetails, fetchComments } from '../services/YouTubeServices';
import { generarIdea } from '../services/ChatGPTServices';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
  color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
}));

const HighlightedText = styled(Typography)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.main,
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
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
}));

const SquareBackButton = styled(IconButton)(({ theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: 0,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.error.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.error.dark,
  },
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  padding: theme.spacing(0.5),
}));

const GenerateIdeaButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  padding: theme.spacing(3),
}));

export default function VideoDetails({ user, isPremium, onUpgradeToPremium }) {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [videoDetails, setVideoDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingIdea, setLoadingIdea] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [credits, setCredits] = useState(isPremium ? 'unlimited' : 10);
  const [canGenerate, setCanGenerate] = useState(true);

  // Verifica que user e isPremium estén definidos
  useEffect(() => {
    console.log('User:', user);
    console.log('Is Premium:', isPremium);
  }, [user, isPremium]);

  const loadVideoDetails = useCallback(async () => {
    if (!videoId) return;
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
    if (!user) {
      setSnackbarMessage("Debes iniciar sesión para generar ideas.");
      setSnackbarOpen(true);
      return;
    }
    if (!videoDetails) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/check-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();

      if (data.canGenerate) {
        setCredits(data.credits);
        setCanGenerate(true);
        setLoadingIdea(true);
        setErrorMessage("");
        setIdea(null);
        try {
          const result = await generarIdea(videoDetails, comments, isPremium);
          if (result.success && result.idea) {
            setIdea(result.idea);
            setIsSaved(false); // Resetear el estado de guardado para la nueva idea
          } else {
            throw new Error(result.error || "Error desconocido al generar la idea.");
          }
        } catch (error) {
          console.error("Error generating idea:", error);
          setErrorMessage(error instanceof Error ? error.message : "Error al generar la idea. Por favor, intenta de nuevo.");
          setSnackbarOpen(true);
        } finally {
          setLoadingIdea(false);
        }
      } else {
        setCanGenerate(false);
        setSnackbarMessage("No tienes créditos suficientes. Actualiza a premium para ideas ilimitadas.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error checking credits:", error);
      setSnackbarMessage("Error al verificar créditos. Intenta de nuevo.");
      setSnackbarOpen(true);
    }
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbarMessage(`${section} copiado al portapapeles`);
      setSnackbarOpen(true);
    }).catch(err => {
      console.error('Error al copiar: ', err);
      setSnackbarMessage('Error al copiar al portapapeles');
      setSnackbarOpen(true);
    });
  };

  const renderIdea = (idea) => {
    return (
      <StyledPaper elevation={3}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6">
            {idea.titulo || 'Título no disponible'}
          </Typography>
          <CopyButton onClick={() => copyToClipboard(idea.titulo, 'Título')} aria-label="Copiar título">
            <ContentCopyIcon fontSize="small" />
          </CopyButton>
        </Box>
        <Box mb={2}>
          <Box display="flex" alignItems="center">
            <HighlightedText variant="subtitle1" gutterBottom>
              Guión:
            </HighlightedText>
            <CopyButton onClick={() => copyToClipboard(idea.guion, 'Guión')} aria-label="Copiar guión">
              <ContentCopyIcon fontSize="small" />
            </CopyButton>
          </Box>
          <Typography variant="body2">
            {idea.guion || 'Guión no disponible'}
          </Typography>
        </Box>
        <Box mb={2}>
          <Box display="flex" alignItems="center">
            <HighlightedText variant="subtitle1" gutterBottom>
              Hashtags:
            </HighlightedText>
            <CopyButton onClick={() => copyToClipboard(idea.hashtags.join(' '), 'Hashtags')} aria-label="Copiar hashtags">
              <ContentCopyIcon fontSize="small" />
            </CopyButton>
          </Box>
          <Typography variant="body2">
            {idea.hashtags && idea.hashtags.length > 0 ? idea.hashtags.join(' ') : 'No hay hashtags disponibles'}
          </Typography>
        </Box>
        {isPremium && (
          <Box mb={2}>
            <Box display="flex" alignItems="center">
              <HighlightedText variant="subtitle1" gutterBottom>
                Sugerencias de Producción:
              </HighlightedText>
              <CopyButton onClick={() => copyToClipboard(idea.sugerenciasProduccion.join('\n'), 'Sugerencias de Producción')} aria-label="Copiar sugerencias de producción">
                <ContentCopyIcon fontSize="small" />
              </CopyButton>
            </Box>
            {idea.sugerenciasProduccion && idea.sugerenciasProduccion.length > 0 ? (
              <List>
                {idea.sugerenciasProduccion.map((sugerencia, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={sugerencia} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2">No hay Sugerencias de producción disponibles</Typography>
            )}
          </Box>
        )}
        {isPremium && idea.ideasAdicionales && idea.ideasAdicionales.length > 0 && (
          <Box mt={2}>
            <Box display="flex" alignItems="center">
              <HighlightedText variant="subtitle1" gutterBottom>
                Ideas Adicionales:
              </HighlightedText>
              <CopyButton onClick={() => copyToClipboard(idea.ideasAdicionales.join('\n'), 'Ideas Adicionales')} aria-label="Copiar ideas adicionales">
                <ContentCopyIcon fontSize="small" />
              </CopyButton>
            </Box>
            <List>
              {idea.ideasAdicionales.map((ideaAdicional, index) => (
                <ListItem key={index}>
                  <ListItemText primary={ideaAdicional} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        {isPremium && (
          <Button
            startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            onClick={handleSaveIdea}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            {isSaved ? 'Idea Guardada' : 'Guardar Idea'}
          </Button>
        )}
      </StyledPaper>
    );
  };

  const formatViewCount = (count) => {
    if (count >= 1000000000) return (count / 1000000000).toFixed(1) + 'B';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const handleSaveIdea = async () => {
    if (!isPremium) {
      setSnackbarMessage("Esta función es solo para usuarios premium");
      setSnackbarOpen(true);
      return;
    }

    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      console.error("La URL de la API no está definida en las variables de entorno");
      setSnackbarMessage("Error de configuración. Por favor, contacta al soporte.");
      setSnackbarOpen(true);
      return;
    }

    console.log('Attempting to save idea to:', `${apiUrl}/api/save-idea`);
    console.log('Payload:', JSON.stringify({
      userId: user.id,
      idea: idea,
      videoId: videoId
    }));

    try {
      const response = await fetch(`${apiUrl}/api/save-idea`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          idea: idea,
          videoId: videoId
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      if (data.success) {
        setIsSaved(true);
        setSnackbarMessage("Idea guardada con éxito");
      } else {
        throw new Error(data.error || 'Error desconocido al guardar la idea');
      }
    } catch (error) {
      console.error("Error saving idea:", error);
      setSnackbarMessage(`Error al guardar la idea: ${error.message}`);
    } finally {
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar style={{ minHeight: '48px', padding: 0 }}>
          <SquareBackButton onClick={() => navigate(-1)} aria-label="back">
            <ArrowBackIcon />
          </SquareBackButton>
        </Toolbar>
      </AppBar>
      <MainContent>
        <Container maxWidth="md">
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
              <Typography variant="h5" gutterBottom align="center" sx={{ mb: 2, color: theme.palette.text.primary }}>
                {videoDetails.title}
              </Typography>
              {user ? (
                <Box display="flex" justifyContent="center" mb={2}>
                  <GenerateIdeaButton
                    variant="contained"
                    onClick={handleGenerateIdea}
                    disabled={loadingIdea || !canGenerate}
                    sx={{ maxWidth: '300px', width: '100%' }}
                  >
                    {loadingIdea ? 'Generando Idea...' : 
                     !canGenerate ? 'Sin Créditos' :
                     idea ? 'Generar Otra Idea' : 'Generar Idea Para Video'}
                  </GenerateIdeaButton>
                </Box>
              ) : (
                <Box textAlign="center" mt={2}>
                  <Typography variant="body1" gutterBottom>
                    Debes iniciar sesión para generar ideas.
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 1 }}
                  >
                    Iniciar Sesión
                  </Button>
                </Box>
              )}
              {user && idea && renderIdea(idea)}
              {errorMessage && (
                <Typography color="error" align="center" mt={2}>
                  {errorMessage}
                </Typography>
              )}
              <Typography variant="h6" gutterBottom sx={{ mt: 4, color: theme.palette.text.primary }} align="center">
                Comentarios Relevantes
              </Typography>
              <List>
                {comments.map((comment, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={comment.author}
                      secondary={comment.text}
                      primaryTypographyProps={{ color: theme.palette.text.primary }}
                      secondaryTypographyProps={{ color: theme.palette.text.secondary }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Container>
      </MainContent>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage || errorMessage}
      />
      {!isPremium && (
        <Typography variant="body2" align="center">
          Créditos restantes: {credits}
        </Typography>
      )}
    </Box>
  );
}