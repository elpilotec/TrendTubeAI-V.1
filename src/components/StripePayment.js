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

const CheckoutForm = ({ amount, onSuccess, onError, onClose, apiUrl, user }) => {
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

    if (!user || !user.id) {
      setError('Usuario no válido. Por favor, inicia sesión nuevamente.');
      setProcessing(false);
      return;
    }

    try {
      console.log('Iniciando proceso de pago para el usuario:', user.id);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount, userId: user.id }),
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error del servidor:', errorData);
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}\n${errorData}`);
      }

      const data = await response.json();
      console.log('Datos recibidos del servidor:', data);

      if (!data.clientSecret) {
        throw new Error('No se recibió el client secret del servidor');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        console.error('Error de Stripe:', stripeError);
        throw new Error(stripeError.message);
      }

      console.log('Estado del pago:', paymentIntent.status);

      if (paymentIntent.status === 'succeeded') {
        console.log('Pago exitoso, confirmando suscripción...');
        const confirmResponse = await fetch('/api/confirm-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id, paymentIntentId: paymentIntent.id }),
        });

        if (confirmResponse.ok) {
          console.log('Suscripción confirmada exitosamente');
          onSuccess(paymentIntent);
        } else {
          const confirmErrorData = await confirmResponse.text();
          console.error('Error al confirmar la suscripción:', confirmErrorData);
          throw new Error('Error al confirmar la suscripción');
        }
      } else {
        throw new Error(`Estado del pago inesperado: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('Error en el proceso de pago:', err);
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

const StripePayment = ({ amount, onSuccess, onError, onClose, apiUrl = '/api/create-payment-intent', user }) => {
  return (
    <Elements stripe={stripePromise}>
      <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Completa tu pago
        </Typography>
        <CheckoutForm 
          amount={amount} 
          onSuccess={onSuccess} 
          onError={onError || ((err) => console.error('Error de pago:', err))} 
          onClose={onClose} 
          apiUrl={apiUrl} 
          user={user} 
        />
      </Box>
    </Elements>
  );
};

export default StripePayment;