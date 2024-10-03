import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Paper, Box, CircularProgress, 
  Container, IconButton, Divider, Chip, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BookmarkIcon from '@mui/icons-material/Bookmark';

export default function SavedIdeas({ user }) {
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedIdeas = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/saved-ideas/${user.id}`);
      if (!response.ok) {
        throw new Error('Error fetching saved ideas');
      }
      const data = await response.json();
      setSavedIdeas(data);
    } catch (error) {
      console.error("Error fetching saved ideas:", error);
      setError("No se pudieron cargar las ideas guardadas");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchSavedIdeas();
  }, [fetchSavedIdeas]);

  const handleDeleteIdea = async (ideaId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/delete-idea/${ideaId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSavedIdeas(savedIdeas.filter(idea => idea._id !== ideaId));
      } else {
        throw new Error('Error deleting idea');
      }
    } catch (error) {
      console.error("Error deleting idea:", error);
      setError("No se pudo eliminar la idea");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BookmarkIcon sx={{ mr: 1 }} /> Ideas Guardadas
      </Typography>
      {savedIdeas.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No tienes ideas guardadas aún.</Typography>
        </Paper>
      ) : (
        savedIdeas.map((idea) => (
          <Paper key={idea._id} elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{idea.titulo}</Typography>
              <Tooltip title="Eliminar idea">
                <IconButton onClick={() => handleDeleteIdea(idea._id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{idea.guion}</Typography>
            <Box sx={{ mt: 2 }}>
              {idea.hashtags.map((tag, index) => (
                <Chip key={index} label={tag} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
          </Paper>
        ))
      )}
    </Container>
  );
}
