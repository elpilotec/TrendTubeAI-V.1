import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Paper, Box, CircularProgress, 
  Container, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Ideas Guardadas</Typography>
      {savedIdeas.length === 0 ? (
        <Typography>No tienes ideas guardadas aún.</Typography>
      ) : (
        savedIdeas.map((idea) => (
          <Paper key={idea._id} elevation={3} sx={{ mb: 2, p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{idea.titulo}</Typography>
              <IconButton onClick={() => handleDeleteIdea(idea._id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
            <Typography variant="body1">{idea.guion}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>Hashtags: {idea.hashtags.join(', ')}</Typography>
          </Paper>
        ))
      )}
    </Container>
  );
}
