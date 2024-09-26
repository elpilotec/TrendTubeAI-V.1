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
  Paper,
} from '@mui/material';
import {
  Star as StarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import StripePayment from './StripePayment';

export default function PremiumSubscription({ onUpgrade, onClose }) {
  const [showStripePayment, setShowStripePayment] = useState(false);

  const handleSubscribe = () => {
    setShowStripePayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowStripePayment(false);
    onUpgrade();
  };

  const handlePaymentClose = () => {
    setShowStripePayment(false);
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 4, overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', p: 3, bgcolor: 'background.paper' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
          }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Premium Subscription
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: 'text.primary' }}>
          Get access to exclusive features for only $5 per month:
        </Typography>
        <List>
          {['Enhanced idea generation', 'Save ideas to favorites', 'Priority support'].map((feature, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={feature} primaryTypographyProps={{ color: 'text.primary' }} />
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          color="primary"
          startIcon={<StarIcon />}
          onClick={handleSubscribe}
          fullWidth
          sx={{ mt: 2 }}
        >
          Subscribe for $5/month
        </Button>
      </Box>
      {showStripePayment && (
        <StripePayment
          amount={5}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}
    </Paper>
  );
}