import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button, Box, Typography, CircularProgress } from '@mui/material';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error: backendError, clientSecret } = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount * 100 }), // amount in cents
      }).then(res => res.json());

      if (backendError) {
        setError(backendError.message);
        setProcessing(false);
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        // Here you can call a function to update the user's subscription status
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred.');
    }

    setProcessing(false);
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
      {error && <Typography color="error" mt={2}>{error}</Typography>}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!stripe || processing}
        sx={{ mt: 2 }}
      >
        {processing ? <CircularProgress size={24} /> : `Pay $${amount}`}
      </Button>
    </form>
  );
};

const StripePayment = ({ amount }) => {
  return (
    <Elements stripe={stripePromise}>
      <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Complete Your Payment
        </Typography>
        <CheckoutForm amount={amount} />
      </Box>
    </Elements>
  );
};

export default StripePayment;