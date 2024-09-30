import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess, onError, onClose, apiUrl, user }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user || !user.id) {
      setError('Usuario no válido. Por favor, inicia sesión nuevamente.');
    } else {
      setError(null);
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe no se ha inicializado.');
      setProcessing(false);
      return;
    }

    if (!user || !user.id) {
      setError('Usuario no válido. Por favor, inicia sesión nuevamente.');
      setProcessing(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount, userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error del servidor: ${errorData}`);
      }

      const data = await response.json();
      if (!data.clientSecret) {
        throw new Error('No se recibió el client secret del servidor');
      }

      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        const confirmResponse = await fetch('/api/confirm-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, paymentIntentId: paymentIntent.id }),
        });

        if (confirmResponse.ok) {
          onSuccess(paymentIntent);
        } else {
          const confirmErrorData = await confirmResponse.text();
          throw new Error('Error al confirmar la suscripción');
        }
      } else {
        throw new Error(`Estado del pago inesperado: ${paymentIntent.status}`);
      }
    } catch (err) {
      setError(err.message);
      if (typeof onError === 'function') {
        onError(err);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 2 }}>
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#ffffff' } } }} />
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      <Button type="submit" variant="contained" fullWidth disabled={!stripe || processing}>
        {processing ? <CircularProgress size={24} /> : `PAGAR $${(amount / 100).toFixed(2)} POR UN AÑO`}
      </Button>
      <Button onClick={onClose} variant="outlined" fullWidth>
        CANCELAR
      </Button>
    </form>
  );
};

const StripePayment = ({ amount, onSuccess, onError, onClose, apiUrl = '/api/create-payment-intent', user }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} onClose={onClose} apiUrl={apiUrl} user={user} />
    </Elements>
  );
};

export default StripePayment;