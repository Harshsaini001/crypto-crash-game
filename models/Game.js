const mongoose = require('mongoose');
const gameSchema = new mongoose.Schema({
  roundId: String,
  crashPoint: Number,
  status: { type: String, enum: ['pending', 'running', 'crashed'], default: 'pending' },
  players: [{
    playerId: String,
    cryptoAmount: Number,
    usdAmount: Number,
    currency: String,
    hasCashedOut: { type: Boolean, default: false },
    multiplierAtCashout: Number
  }],
  startTime: Date,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Game', gameSchema);
