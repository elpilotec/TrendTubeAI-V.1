const path = require('path');
const dotenv = require('dotenv');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Determina qué archivo .env cargar basado en NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, envFile) });

console.log('Entorno:', process.env.NODE_ENV);
console.debug('MONGODB_URI:', process.env.MONGODB_URI);
console.debug('FRONTEND_URL:', process.env.FRONTEND_URL);
console.debug('API_URL:', process.env.API_URL);

console.log('Iniciando servidor...');
const express = require('express');
const cors = require('cors');  // Añade esta línea
const connectDB = require('./models/db');
const SavedIdea = require('./models/savedIdeaModel');
const UserCredit = require('./models/userCreditModel');
const Subscription = require('./models/subscriptionModel');
// Elimina la línea que importa './models'

connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Variables de entorno cargadas:');
console.debug('MONGODB_URI:', process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.debug('FRONTEND_URL:', process.env.FRONTEND_URL);
console.debug('API_URL:', process.env.API_URL);

// Configuración de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Habilitar pre-flight en todas las rutas
app.options('*', cors());

// Conectar a la base de datos
connectDB()
  .then(() => console.log('Conexión exitosa con la base de datos'))
  .catch(err => console.error('Error conectando a la base de datos:', err));

app.use(express.json());

// Middleware para manejar errores generales
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Middleware para depurar
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
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

      // Actualizar el estado premium del usuario
      await UserCredit.findOneAndUpdate(
        { userId },
        { isPremium: true },
        { upsert: true, new: true }
      );

      res.json({ success: true, message: 'Suscripción anual confirmada y estado premium actualizado' });
    } else {
      res.status(400).json({ error: 'El pago no se ha completado correctamente' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al confirmar la suscripción', details: error.message });
  }
});

// Endpoint para verificar la suscripción del usuario
app.get('/api/check-subscription-status', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'Se requiere un ID de usuario' });
    }

    const userCredit = await UserCredit.findOne({ userId });
    if (!userCredit) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const subscription = await Subscription.findOne({ userId, status: 'active' });
    const isPremium = userCredit.isPremium || (subscription && new Date() < subscription.endDate);

    if (isPremium) {
      res.json({ 
        isPremium: true,
        isActive: true,
        endDate: subscription ? subscription.endDate : null,
        subscriptionType: subscription ? subscription.subscriptionType : 'lifetime',
        daysRemaining: subscription ? Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)) : 'unlimited'
      });
    } else {
      res.json({ isPremium: false, isActive: false, message: 'No hay suscripción activa' });
    }
  } catch (error) {
    console.error('Error al verificar el estado de la suscripción:', error);
    res.status(500).json({ error: 'Error al verificar el estado de la suscripción' });
  }
});

// Endpoint para guardar una idea
app.post('/api/save-idea', async (req, res) => {
  console.log('Received save idea request:', req.body);
  try {
    const { userId, videoId, titulo, guion, hashtags, sugerenciasProduccion, ideasAdicionales } = req.body;
    const newIdea = new SavedIdea({
      userId,
      videoId,
      titulo,
      guion,
      hashtags,
      sugerenciasProduccion,
      ideasAdicionales
    });
    await newIdea.save();
    console.log('Idea saved successfully');
    res.json({ success: true, message: 'Idea guardada con éxito' });
  } catch (error) {
    console.error('Error saving idea:', error);
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
    console.debug('MongoDB URI:', process.env.MONGODB_URI);
    console.log('Modo:', process.env.NODE_ENV);
    console.log('URL del frontend:', process.env.FRONTEND_URL);
    console.log('URL de la API:', process.env.API_URL);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Puerto ${port} está en uso, intentando con el siguiente...`);
      startServer(port + 1);
    } else {
      console.error('Error al iniciar el servidor:', err);
    }
  });
};

startServer(PORT);

// Añadir este endpoint para verificar y actualizar créditos
app.post('/api/check-credits', async (req, res) => {
  try {
    const { userId } = req.body;
    let userCredit = await UserCredit.findOne({ userId });

    if (!userCredit) {
      userCredit = new UserCredit({ userId });
      await userCredit.save();
    }

    if (userCredit.isPremium) {
      res.json({ canGenerate: true, credits: 'unlimited' });
    } else if (userCredit.credits > 0) {
      userCredit.credits -= 1;
      await userCredit.save();
      res.json({ canGenerate: true, credits: userCredit.credits });
    } else {
      res.json({ canGenerate: false, credits: 0 });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar créditos' });
  }
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}