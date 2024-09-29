const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,  // Asegura una sola suscripción activa por usuario
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
        return value > this.startDate;  // Verifica que endDate sea posterior a startDate
      },
      message: 'La fecha de finalización debe ser posterior a la fecha de inicio',
    },
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active',
  },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
