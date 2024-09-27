import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button, Box, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess, onError, onClose, apiUrl }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe no se ha inicializado.');
      setProcessing(false);
      return;
    }

    try {
      console.log('Intentando conectar con:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}\n${errorData}`);
      }

      const data = await response.json();

      if (!data.clientSecret) {
        throw new Error('No se recibió el client secret del servidor');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        throw new Error(`Estado del pago: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('Error en el pago:', err);
      setError(err.message);
      setDialogMessage(getErrorMessage(err));
      setOpenDialog(true);
      if (typeof onError === 'function') {
        onError(err);
      } else {
        console.error('onError no es una función:', onError);
      }
    } finally {
      setProcessing(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error.message.includes('Failed to fetch')) {
      return 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet y que el servidor esté en funcionamiento.';
    }
    switch (error.code) {
      case 'card_declined':
        return 'Tu tarjeta ha sido rechazada. Por favor, verifica los datos o intenta con otra tarjeta.';
      case 'expired_card':
        return 'Tu tarjeta ha expirado. Por favor, utiliza una tarjeta válida.';
      case 'incorrect_cvc':
        return 'El código de seguridad (CVC) es incorrecto. Por favor, verifica e intenta de nuevo.';
      case 'processing_error':
        return 'Hubo un error al procesar tu pago. Por favor, intenta de nuevo más tarde.';
      default:
        return 'Hubo un error en el proceso de pago. Por favor, verifica tus datos e intenta de nuevo.';
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!stripe || processing}
        sx={{ mt: 2 }}
      >
        {processing ? <CircularProgress size={24} /> : `Pagar $${amount.toFixed(2)}`}
      </Button>
      <Button
        onClick={onClose}
        variant="outlined"
        fullWidth
        sx={{ mt: 1 }}
      >
        Cancelar
      </Button>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Error en el pago</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

const StripePayment = ({ amount, onSuccess, onError, onClose, apiUrl = 'http://localhost:3001/api/create-payment-intent' }) => {
  return (
    <Elements stripe={stripePromise}>
      <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Completa tu pago
        </Typography>
        <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} onClose={onClose} apiUrl={apiUrl} />
      </Box>
    </Elements>
  );
};

export default StripePayment;