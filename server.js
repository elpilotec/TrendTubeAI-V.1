require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.REACT_APP_STRIPE_SECRET_KEY);
const connectDB = require('./server/db');
const Subscription = require('./server/subscriptionModel');

const app = express();

// Conectar a la base de datos
connectDB()
  .then(() => console.log('Conexión exitosa con la base de datos'))
  .catch(err => console.error('Error conectando a la base de datos:', err));

app.use(cors());
app.use(express.json());

// Endpoint para crear una intención de pago
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, userId } = req.body;
    if (!amount || isNaN(amount) || !userId) {
      return res.status(400).json({ error: 'Se requiere una cantidad válida y un ID de usuario' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount), // No multiplicar por 100 ya que amount ya está en centavos
      currency: 'usd',
      metadata: { userId, subscriptionType: 'annual' },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la intención de pago', details: error.message });
  }
});

// Endpoint para confirmar la suscripción tras el pago
app.post('/api/confirm-subscription', async (req, res) => {
  try {
    const { userId, paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 año

      const subscription = new Subscription({
        userId,
        startDate,
        endDate,
        status: 'active',
        subscriptionType: 'annual',
        amount: paymentIntent.amount / 100, // Convertimos de centavos a dólares
      });

      await subscription.save();
      res.json({ success: true, message: 'Suscripción anual confirmada' });
    } else {
      res.status(400).json({ error: 'El pago no se ha completado correctamente' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al confirmar la suscripción', details: error.message });
  }
});

// Endpoint para verificar la suscripción del usuario
app.get('/api/check-subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Se requiere un ID de usuario válido' });
    }

    const subscription = await Subscription.findOne({ userId, status: 'active' });

    if (subscription && subscription.endDate > new Date()) {
      res.json({ 
        isActive: true, 
        endDate: subscription.endDate,
        subscriptionType: subscription.subscriptionType,
        daysRemaining: Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)) // Calculamos días restantes
      });
    } else {
      res.json({ isActive: false, message: 'No hay suscripción activa o ha caducado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al verificar la suscripción' });
  }
});

// Middleware para manejar errores generales
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor', details: err.message });
});

// Inicializar servidor
const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Puerto ${port} está en uso, intentando con el siguiente...`);
      startServer(port + 1);
    } else {
      console.error('Error al iniciar el servidor:', err);
    }
  });
};

const PORT = process.env.PORT || 3001;
startServer(PORT);