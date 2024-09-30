const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,  // Asegura que un usuario solo pueda tener una suscripción activa
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > this.startDate;  // Validación para asegurar que la fecha de finalización es posterior a la de inicio
      },
      message: 'La fecha de finalización debe ser posterior a la fecha de inicio',
    },
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active',
  },
  subscriptionType: {
    type: String,
    enum: ['annual', 'monthly'],
    default: 'annual',
  },
  amount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);


