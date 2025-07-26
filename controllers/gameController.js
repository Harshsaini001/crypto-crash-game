const Game = require('../models/Game');
const Player = require('../models/Player');
const { getCryptoPrice } = require('../services/cryptoService');

exports.placeBet = async (req, res) => {
  try {
    const { username, usdAmount, currency } = req.body;
    const player = await Player.findOne({ username });
    if (!player) return res.status(404).json({ message: 'Player not found' });

    const price = await getCryptoPrice(currency);
    const cryptoAmount = usdAmount / price;

    if (player.wallet[currency] < cryptoAmount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    player.wallet[currency] -= cryptoAmount;
    await player.save();

    res.json({ message: 'Bet placed', cryptoAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cashOut = async (req, res) => {
  try {
    res.json({ message: 'Handled via WebSocket' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
