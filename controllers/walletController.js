const Player = require('../models/Player');
const { getCryptoPrice } = require('../services/cryptoService');

exports.getBalance = async (req, res) => {
  try {
    const player = await Player.findOne({ username: req.params.username });
    if (!player) return res.status(404).json({ message: 'Player not found' });

    const balances = {};
    for (const [currency, amount] of Object.entries(player.wallet)) {
      const price = await getCryptoPrice(currency);
      balances[currency] = {
        crypto: amount,
        usd: amount * price
      };
    }

    res.json({ username: player.username, balances });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
