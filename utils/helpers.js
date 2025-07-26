const crypto = require('crypto');
function generateCrashPoint(seed, round) {
  const hash = crypto.createHash('sha256').update(seed + round).digest('hex');
  const intVal = parseInt(hash.substring(0, 8), 16);
  const max = 10000;
  return (1 + (intVal % max) / 100).toFixed(2);
}
module.exports = { generateCrashPoint };
