require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const connectDB = require('./server/db');
const Subscription = require('./server/subscriptionModel');
const SavedIdea = require('./server/savedIdeaModel');

const app = express();

// Asegúrate de que esto esté antes de cualquier ruta
app.use(cors({
  origin: 'https://www.trendtubeai.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Conectar a la base de datos
connectDB()
  .then(() => console.log('Conexión exitosa con la base de datos'))
  .catch(err => console.error('Error conectando a la base de datos:', err));

app.use(express.json());

// Middleware para manejar errores generales
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.trendtubeai.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Endpoint para crear una intención de pago
app.post('/api/create-payment-intent', async (req, res) => {
  console.log('Received request:', req.body);
  const { email } = req.body;
  
  console.log('Checking pro status for email:', email);
  const isPro = await checkProStatus(email);
  console.log('Is Pro?', isPro);

  try {
    const { amount, userId, customerInfo } = req.body;
    if (!amount || isNaN(amount) || !userId || !customerInfo) {
      return res.status(400).json({ error: 'Se requiere una cantidad válida, un ID de usuario y la información del cliente' });
    }

    // Crear o actualizar el cliente en Stripe
    let customer;
    try {
      customer = await stripe.customers.create({
        email: customerInfo.email,
        name: customerInfo.name,
        address: {
          line1: customerInfo.address,
          city: customerInfo.city,
          state: customerInfo.state,
          postal_code: customerInfo.postalCode,
          country: customerInfo.country,
        },
      });
    } catch (stripeError) {
      console.error('Error al crear el cliente en Stripe:', stripeError);
      return res.status(500).json({ error: 'Error al procesar la información del cliente' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency: 'usd',
      customer: customer.id,
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

// Endpoint para guardar una idea
app.post('/api/save-idea', async (req, res) => {
  try {
    const { userId, idea, videoId } = req.body;
    const savedIdea = new SavedIdea({
      userId,
      videoId,
      ...idea
    });
    await savedIdea.save();
    res.json({ success: true, message: 'Idea guardada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la idea', details: error.message });
  }
});

// Endpoint para obtener ideas guardadas
app.get('/api/saved-ideas/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const savedIdeas = await SavedIdea.find({ userId });
    res.json(savedIdeas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ideas guardadas', details: error.message });
  }
});

// Endpoint para eliminar una idea guardada
app.delete('/api/delete-idea/:ideaId', async (req, res) => {
  try {
    const { ideaId } = req.params;
    await SavedIdea.findByIdAndDelete(ideaId);
    res.json({ success: true, message: 'Idea eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la idea', details: error.message });
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
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log('Modo:', process.env.NODE_ENV);
  console.log('URL del frontend:', process.env.FRONTEND_URL);
  console.log('URL de la API:', process.env.REACT_APP_API_URL);
});