import React, { useState } from 'react';
import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Star as StarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import StripePayment from './StripePayment';

export default function PremiumSubscription({ onUpgrade, onClose, user }) {
  const [showStripePayment, setShowStripePayment] = useState(false);

  const handleSubscribe = () => {
    setShowStripePayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowStripePayment(false);
    onUpgrade();
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3, position: 'relative' }}>
      {/* Botón de cerrar con posición absoluta */}
      <IconButton 
        onClick={onClose} 
        sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8 
        }}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Suscripción Premium Anual
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Obtén acceso a funciones exclusivas durante un año completo por solo $5:
      </Typography>
      <List>
        {['Generación de Ideas Mejorada', 'Soporte Prioritario','Guardar Ideas Ilimitadas', '365 Días de Acceso Premium'].map((feature) => (
          <ListItem key={feature}>
            <ListItemIcon><CheckIcon /></ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>
      <Button 
        variant="contained" 
        startIcon={<StarIcon />} 
        fullWidth 
        onClick={handleSubscribe}
      >
        SUSCRIBIRSE POR $5/AÑO
      </Button>
      {showStripePayment && (
        <StripePayment
          amount={500} // Amount in cents
          onSuccess={handlePaymentSuccess}
          user={user}
        />
      )}
    </Paper>
  );
}