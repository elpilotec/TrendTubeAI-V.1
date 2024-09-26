import React, { useState } from 'react';
import {
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Star as StarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import PaymentModal from './PaymentModal';

interface PremiumSubscriptionProps {
  onUpgrade: () => void;
  onClose: () => void;
}

export default function PremiumSubscription({ onUpgrade, onClose }: PremiumSubscriptionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSubscribe = () => {
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handlePaymentSubmit = (paymentDetails: any) => {
    setIsLoading(true);
    // Simulate API call for payment processing
    setTimeout(() => {
      setIsLoading(false);
      onUpgrade();
      onClose();
    }, 2000);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        mt: 2,
        p: 3,
        border: '2px solid #ff6666',
        borderRadius: 2,
        backgroundColor: '#fff1f1',
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#ff6666',
        }}
        aria-label="Cerrar"
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h5" gutterBottom sx={{ color: '#ff6666', fontWeight: 'bold' }}>
        Suscripción Premium
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ color: '#333' }}>
        Obtén acceso a funciones exclusivas por solo $5 al mes:
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <CheckIcon sx={{ color: '#ff6666' }} />
          </ListItemIcon>
          <ListItemText primary="Generación de ideas mejorada" primaryTypographyProps={{ sx: { color: '#333' } }} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckIcon sx={{ color: '#ff6666' }} />
          </ListItemIcon>
          <ListItemText primary="Guardar ideas en favoritos" primaryTypographyProps={{ sx: { color: '#333' } }} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckIcon sx={{ color: '#ff6666' }} />
          </ListItemIcon>
          <ListItemText primary="Prioridad en el soporte" primaryTypographyProps={{ sx: { color: '#333' } }} />
        </ListItem>
      </List>
      <Button
        variant="contained"
        color="primary"
        startIcon={<StarIcon />}
        onClick={handleSubscribe}
        fullWidth
        disabled={isLoading}
        sx={{
          mt: 2,
          backgroundColor: '#ff6666',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#ff4444',
          },
        }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Suscribirse por $5/mes'}
      </Button>
      <PaymentModal
        open={showPaymentModal}
        onClose={handleClosePaymentModal}
        onSubmit={handlePaymentSubmit}
      />
    </Box>
  );
}