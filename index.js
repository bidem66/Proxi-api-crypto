// index.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.get('/news/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const r = await fetch(`https://newsapi.org/v2/everything?q=${symbol}&language=en&apiKey=${process.env.NEWS_API_KEY}`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'News fetch failed' });
  }
});

app.get('/rsi/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const url = `https://api.taapi.io/rsi?secret=${process.env.TAAPI_KEY}&exchange=binance&symbol=${symbol}/USDT&interval=1h`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: 'RSI fetch failed' });
  }
});

app.get('/macd/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const url = `https://api.taapi.io/macd?secret=${process.env.TAAPI_KEY}&exchange=binance&symbol=${symbol}/USDT&interval=1h`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: 'MACD fetch failed' });
  }
});

app.get('/lunar/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const r = await fetch(`https://lunarcrush.com/api3/coins?symbol=${symbol}&key=${process.env.LUNAR_API_KEY}`);
    const data = await r.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: 'LunarCrush fetch failed' });
  }
});

app.get('/coinmarketcal/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const r = await fetch(`https://developers.coinmarketcal.com/v1/events?coins=${symbol}&access_token=${process.env.COINMARKETCAL_KEY}`);
    const data = await r.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: 'CoinMarketCal fetch failed' });
  }
});

app.get('/token-terminal/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const r = await fetch(`https://api.tokenterminal.com/v2/projects/${symbol}/metrics/active_addresses_24h`, {
      headers: { Authorization: `Bearer ${process.env.TOKEN_TERMINAL_KEY}` }
    });
    const data = await r.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Token Terminal fetch failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy API server running on port ${PORT}`);
});
