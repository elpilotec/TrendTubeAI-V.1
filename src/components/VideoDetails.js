import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Button, Paper, Box, List, ListItem, ListItemText, CircularProgress, 
  Snackbar, Container, AppBar, Toolbar, IconButton, useTheme, Dialog, DialogContent, DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { fetchVideoDetails, fetchComments } from '../services/YouTubeServices';
import { generarIdea } from '../services/ChatGPTServices';
import AdSense from './AdSense';

const AD_SLOT = process.env.REACT_APP_ADSENSE_SLOT;

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
  color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.main,
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

interface VideoDetailsProps {
  isPremium: boolean;
  isLoggedIn: boolean;
}

export default function VideoDetails({ isPremium, isLoggedIn }: VideoDetailsProps) {
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
  const [showAd, setShowAd] = useState(false);
  const [isAdSenseVerified, setIsAdSenseVerified] = useState(false);

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

  useEffect(() => {
    const checkAdSenseVerification = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsAdSenseVerified(true);
    };

    checkAdSenseVerification();
  }, []);

  const handleGenerateIdea = () => {
    setLoadingIdea(true);
    setErrorMessage("");
    setIdea(null);
    if (!isLoggedIn || (!isPremium && isAdSenseVerified)) {
      setShowAd(true);
    } else {
      handleGenerateIdeaWithoutAd();
    }
  };

  const handleGenerateIdeaWithoutAd = async () => {
    try {
      const result = await generarIdea(videoDetails, comments, isPremium);
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

  const handleCloseAd = () => {
    setShowAd(false);
    handleGenerateIdeaWithoutAd();
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
    if (!idea) return null;
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
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar style={{ minHeight: '48px', padding: 0 }}>
          <SquareBackButton onClick={() => navigate(-1)} aria-label="back">
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
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 2, color: theme.palette.text.primary }}>
              {videoDetails.title}
            </Typography>
            <Box display="flex" justifyContent="center" mb={2}>
              <GenerateIdeaButton
                variant="contained"
                onClick={handleGenerateIdea}
                disabled={loadingIdea}
                sx={{ maxWidth: '300px', width: '100%' }}
              >
                {loadingIdea ? 'Generando Idea...' : 'Generar Idea Para Video'}
              </GenerateIdeaButton>
            </Box>
            {idea && renderIdea(idea)}
            <Typography variant="h6" gutterBottom sx={{ mt: 4, color: theme.palette.text.primary }} align="center">
              Mejores Comentarios
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
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage || errorMessage}
        />
        {(!isLoggedIn || !isPremium) && isAdSenseVerified && (
          <Dialog open={showAd} onClose={handleCloseAd} maxWidth="md" fullWidth>
            <DialogContent>
              <AdSense
                adSlot={AD_SLOT}
                style={{ display: 'block', textAlign: 'center' }}
                format="auto"
                responsive={true}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAd}>Cerrar</Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </Box>
  );
}