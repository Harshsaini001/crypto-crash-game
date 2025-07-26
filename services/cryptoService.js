const axios = require('axios');
let cache = { timestamp: 0, prices: {} };

async function getCryptoPrice(symbol) {
  const now = Date.now();
  if (now - cache.timestamp < 10000 && cache.prices[symbol]) return cache.prices[symbol];
  const res = await axios.get(process.env.crypto_api_url, {
    params: { ids: symbol.toLowerCase(), vs_currencies: 'usd' }
  });
  const price = res.data[symbol.toLowerCase()].usd;
  cache.prices[symbol] = price;
  cache.timestamp = now;
  return price;
}
module.exports = { getCryptoPrice };
