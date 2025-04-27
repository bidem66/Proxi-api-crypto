require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Chargez votre clé CryptoCompare (pour RSI & MACD)
const CRYPTOCOMPARE_KEY = process.env.CRYPTOCOMPARE_KEY || process.env.CRYPTOCOMPARE_API_KEY;
// Clé CryptoPanic pour les news
const CRYPTO_PANIC_KEY = process.env.CRYPTO_PANIC_KEY;

// CORS & fichiers statiques
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.use(express.static('public'));

// 1. CoinPaprika (top 1000 tickers)
app.get('/proxy/coinpaprika', async (req, res) => {
  try {
    const r = await fetch('https://api.coinpaprika.com/v1/tickers');
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'CoinPaprika fetch error', details: err.message });
  }
});

// 2. CoinGecko (générique via paramètre `endpoint`)
app.get('/proxy/coingecko', async (req, res) => {
  try {
    const { endpoint, ...query } = req.query;
    const qs = new URLSearchParams(query).toString();
    const r = await fetch(`https://api.coingecko.com/api/v3/${endpoint}?${qs}`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'CoinGecko fetch error', details: err.message });
  }
});

// 3. Finnhub (actions)
app.get('/proxy/finnhub', async (req, res) => {
  try {
    const { symbol } = req.query;
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_KEY}`;
    const r = await fetch(url);
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: 'Finnhub fetch error', details: err.message });
  }
});

// 4. Binance (cryptos spot)
app.get('/proxy/binance', async (req, res) => {
  try {
    const { symbol } = req.query;
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
    const r = await fetch(url);
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: 'Binance fetch error', details: err.message });
  }
});

// 5. CryptoPanic (news)
app.get('/proxy/news', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    const base = 'https://cryptopanic.com/api/v1/posts/';
    const params = new URLSearchParams({
      auth_token: CRYPTO_PANIC_KEY,
      public: 'true',
      filter: 'hot',
      limit: limit.toString()
    });
    if (q) {
      params.append('currencies', q.toUpperCase());
    }
    const url = `${base}?${params.toString()}`;
    const apiRes = await fetch(url);
    const json = await apiRes.json();
    res.json({
      status: apiRes.ok ? 'ok' : 'error',
      articles: Array.isArray(json.results) ? json.results : []
    });
  } catch (err) {
    res.status(500).json({ error: 'CryptoPanic fetch error', details: err.message });
  }
});

// 6. CoinGecko Events (remplace CoinMarketCal)
app.get('/proxy/events', async (req, res) => {
  try {
    const { coins, ...rest } = req.query;
    const params = new URLSearchParams({
      ...(coins ? { coins } : {}),
      ...rest
    }).toString();
    const url = `https://api.coingecko.com/api/v3/events?${params}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'CoinGecko Events fetch error', details: err.message });
  }
});

// 7. CryptoCompare – RSI
app.get('/proxy/cryptocompare/rsi', async (req, res) => {
  try {
    const { fsym, tsym = 'USD', timePeriod = 14 } = req.query;
    const qs = new URLSearchParams({
      fsym,
      tsym,
      type: 'rsi',
      timePeriod,
      limit: 1,
      api_key: CRYPTOCOMPARE_KEY
    }).toString();
    const r = await fetch(`https://min-api.cryptocompare.com/data/v2/technical_indicator?${qs}`);
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: 'CryptoCompare RSI fetch error', details: err.message });
  }
});

// 8. CryptoCompare – MACD
app.get('/proxy/cryptocompare/macd', async (req, res) => {
  try {
    const { fsym, tsym = 'USD', fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = req.query;
    const qs = new URLSearchParams({
      fsym,
      tsym,
      type: 'macd',
      fastPeriod,
      slowPeriod,
      signalPeriod,
      limit: 1,
      api_key: CRYPTOCOMPARE_KEY
    }).toString();
    const r = await fetch(`https://min-api.cryptocompare.com/data/v2/technical_indicator?${qs}`);
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: 'CryptoCompare MACD fetch error', details: err.message });
  }
});

// 9. Ethplorer – On-Chain (clé publique ou `freekey`)
app.get('/proxy/onchain', async (req, res) => {
  try {
    const { symbol } = req.query;
    const url = `https://api.ethplorer.io/getTokenInfo/${symbol}?apiKey=${process.env.ONCHAIN_API_TOKEN}`;
    const r = await fetch(url);
    const info = await r.json();
    res.json({ data: info });
  } catch (err) {
    res.status(500).json({ error: 'Ethplorer fetch error', details: err.message });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
