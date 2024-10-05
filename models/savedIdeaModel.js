const mongoose = require('mongoose');

const savedIdeaSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  titulo: String,
  guion: String,
  hashtags: [String],
  sugerenciasProduccion: [String],
  ideasAdicionales: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SavedIdea', savedIdeaSchema);
