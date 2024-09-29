require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.REACT_APP_STRIPE_SECRET_KEY);
const connectDB = require('./server/db');
const Subscription = require('./server/subscriptionModel'); // Asegúrate de que el nombre sea correcto

const app = express();

// Imprimir las variables de entorno para diagnosticar el problema
console.log("MONGO_URI:", process.env.REACT_APP_MONGO_URI);
console.log("STRIPE_SECRET_KEY:", process.env.REACT_APP_STRIPE_SECRET_KEY);

// Conectar a la base de datos
connectDB()
  .then(() => console.log('Conexión exitosa con la base de datos'))
  .catch(err => console.error('Error conectando a la base de datos:', err));

app.use(cors());
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, userId } = req.body;
    console.log('Received request to create payment intent:', { amount, userId });

    if (!amount || isNaN(amount) || !userId) {
      return res.status(400).json({ error: 'Se requiere una cantidad válida y un ID de usuario' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt((amount * 100).toFixed(0)),
      currency: 'usd',
      metadata: { userId },
    });

    console.log('Payment intent created successfully:', paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error al crear la intención de pago:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/confirm-subscription', async (req, res) => {
  try {
    const { userId, paymentIntentId } = req.body;
    console.log('Received request to confirm subscription:', { userId, paymentIntentId });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días desde ahora

      const subscription = new Subscription({
        userId,
        startDate,
        endDate,
        status: 'active',
      });

      await subscription.save();
      console.log('Subscription confirmed and saved:', subscription);

      res.json({ success: true, message: 'Suscripción confirmada y guardada' });
    } else {
      console.log('Payment not completed correctly:', paymentIntent.status);
      res.status(400).json({ error: 'El pago no se ha completado correctamente' });
    }
  } catch (error) {
    console.error('Error al confirmar la suscripción:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/check-subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Checking subscription for user:', userId);
    const subscription = await Subscription.findOne({ userId, status: 'active' });

    if (subscription && subscription.endDate > new Date()) {
      console.log('Active subscription found:', subscription);
      res.json({ isActive: true, endDate: subscription.endDate });
    } else {
      console.log('No active subscription found for user:', userId);
      res.json({ isActive: false, message: 'No active subscription found or subscription expired' });
    }
  } catch (error) {
    console.error('Error al verificar la suscripción:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto ${PORT}`));
