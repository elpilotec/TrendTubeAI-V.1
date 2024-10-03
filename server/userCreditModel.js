const mongoose = require('mongoose');

const userCreditSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  credits: {
    type: Number,
    default: 10, // Usuarios no premium comienzan con 10 créditos
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('UserCredit', userCreditSchema);
