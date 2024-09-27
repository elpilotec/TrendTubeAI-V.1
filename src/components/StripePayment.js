import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess, onError, onClose, apiUrl }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

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
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount }), // Enviamos la cantidad sin multiplicar
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
      if (typeof onError === 'function') {
        onError(err);
      } else {
        console.error('onError no es una función:', onError);
      }
    } finally {
      setProcessing(false);
    }
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