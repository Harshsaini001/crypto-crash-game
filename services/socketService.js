const Game = require('../models/Game');
const Player = require('../models/Player');
const { generateCrashPoint } = require('../utils/helpers');
const { getCryptoPrice } = require('./cryptoService');

let ioGlobal = null;
let currentRound = null;
let multiplier = 1;
let interval = null;

function setupSocket(io) {
    ioGlobal = io;
    startNewRound();

    io.on('connection', (socket) => {
        console.log('🟢 Player connected:', socket.id);

        socket.on('placeBet', async({ username, usdAmount, currency }) => {
            const player = await Player.findOne({ username });
            if (!player) return;

            const price = await getCryptoPrice(currency);
            const cryptoAmt = usdAmount / price;

            if (player.wallet[currency] < cryptoAmt) return;

            player.wallet[currency] -= cryptoAmt;
            await player.save();

            currentRound.players.push({
                playerId: player._id,
                usdAmount,
                cryptoAmount: cryptoAmt,
                currency,
                hasCashedOut: false
            });

            await currentRound.save();
        });

       socket.on('cashOut', async({ username, roundId }) => {
    console.log("⚡️ CashOut request received from:", username, roundId);

    const player = await Player.findOne({ username });
    if (!player) return console.log("⛔ Player not found");

    if (!currentRound || currentRound._id.toString() !== roundId) {
        return console.log("⛔ Invalid round");
    }

    const bet = currentRound.players.find(
        (b) => b.playerId.toString() === player._id.toString() && !b.hasCashedOut
    );
    if (!bet) return console.log("⛔ No valid bet to cash out");

    if (multiplier >= currentRound.crashPoint) {
        return console.log("💥 Already crashed! Multiplier =", multiplier.toFixed(2));
    }

    const cashCrypto = bet.cryptoAmount * multiplier;
    player.wallet[bet.currency] += cashCrypto;
    await player.save();

    bet.hasCashedOut = true;
    bet.multiplierAtCashout = multiplier;
    await currentRound.save();

    const usdPayout = cashCrypto * (await getCryptoPrice(bet.currency));

    io.emit('playerCashout', {
        username,
        multiplier: multiplier.toFixed(2),
        usd: usdPayout
    });

    console.log(`✅ ${username} cashed out at x${multiplier.toFixed(2)} for $${usdPayout.toFixed(2)}`);
   });
 });
}

async function startNewRound() {
    currentRound = new Game({
        roundId: `ROUND_${Date.now()}`,
        crashPoint: parseFloat(generateCrashPoint('secretSeed', Date.now()))
    });
    await currentRound.save();

    multiplier = 1;
    ioGlobal.emit('roundStart', { roundId: currentRound._id });

    interval = setInterval(async() => {
        multiplier += 0.01 + multiplier * parseFloat(process.env.growth_factor || 0.02);

        if (multiplier >= currentRound.crashPoint) {
            clearInterval(interval);
            currentRound.status = 'crashed';
            await currentRound.save();
            ioGlobal.emit('roundCrash', { crashPoint: multiplier.toFixed(2) });
            setTimeout(startNewRound, 5000);
        } else {
            ioGlobal.emit('multiplierUpdate', { multiplier });
        }
    }, 100);
}

module.exports = { setupSocket };
