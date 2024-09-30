import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { 
  Button, 
  TextField, 
  Typography, 
  CircularProgress, 
  Alert, 
  Box 
} from '@mui/material';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess, onError, onClose, apiUrl, user }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    if (!user || !user.id) {
      setError('Usuario no válido. Por favor, inicia sesión nuevamente.');
    } else {
      setError(null);
    }
  }, [user]);

  const handleCustomerInfoChange = (event) => {
    const { name, value } = event.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: name === 'country' ? value.toUpperCase().slice(0, 2) : value,
    }));
  };

  const validateCountryCode = (code) => {
    const regex = /^[A-Z]{2}$/;
    return regex.test(code);
  };

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

    if (!validateCountryCode(customerInfo.country)) {
      setError('Por favor, ingrese un código de país válido de 2 caracteres (por ejemplo, ES para España).');
      setProcessing(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amount, 
          userId: user.id,
          customerInfo: customerInfo
        }),
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
      if (!cardElement) {
        throw new Error('No se pudo obtener el elemento de tarjeta');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              state: customerInfo.state,
              postal_code: customerInfo.postalCode,
              country: customerInfo.country,
            },
          },
        },
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
      setError(err.message || 'Error desconocido');
      if (typeof onError === 'function') {
        onError(err);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ '& .MuiTextField-root': { mb: 2 } }}>
        <TextField
          fullWidth
          label="Nombre completo"
          name="name"
          value={customerInfo.name}
          onChange={handleCustomerInfoChange}
          required
        />
        <TextField
          fullWidth
          label="Correo electrónico"
          name="email"
          type="email"
          value={customerInfo.email}
          onChange={handleCustomerInfoChange}
          required
        />
        <TextField
          fullWidth
          label="Dirección"
          name="address"
          value={customerInfo.address}
          onChange={handleCustomerInfoChange}
          required
        />
        <TextField
          fullWidth
          label="Ciudad"
          name="city"
          value={customerInfo.city}
          onChange={handleCustomerInfoChange}
          required
        />
        <TextField
          fullWidth
          label="Estado/Provincia"
          name="state"
          value={customerInfo.state}
          onChange={handleCustomerInfoChange}
          required
        />
        <TextField
          fullWidth
          label="Código Postal"
          name="postalCode"
          value={customerInfo.postalCode}
          onChange={handleCustomerInfoChange}
          required
        />
        <TextField
          fullWidth
          label="Código de País (2 caracteres)"
          name="country"
          value={customerInfo.country}
          onChange={handleCustomerInfoChange}
          inputProps={{ maxLength: 2 }}
          placeholder="ES"
          required
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Información de la tarjeta
        </Typography>
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770' } } }} />
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || processing}
        sx={{ mb: 2 }}
      >
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