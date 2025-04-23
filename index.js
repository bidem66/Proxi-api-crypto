// index.js (backend proxy)
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Autoriser GitHub Pages et localhost pour debug
app.use(cors({ origin: ['https://bidem66.github.io','http://localhost:5500'] }));

app.get("/", (_, res) => res.send("Proxy API is running"));

// CoinGecko proxy avec cache
const coingeckoCache = new Map();
const COINGECKO_TTL = 2 * 60 * 1000;
app.get("/proxy/coingecko", async (req, res) => {
  const { endpoint = "", ...params } = req.query;
  const query = new URLSearchParams(params).toString();
  const url = `https://api.coingecko.com/api/v3/${endpoint}?${query}`;
  const cacheKey = `${endpoint}?${query}`;
  const now = Date.now();
  if (coingeckoCache.has(cacheKey)) {
    const { data, timestamp } = coingeckoCache.get(cacheKey);
    if (now - timestamp < COINGECKO_TTL) return res.json(data);
    coingeckoCache.delete(cacheKey);
  }
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const data = await response.json();
    coingeckoCache.set(cacheKey, { data, timestamp: now });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur CoinGecko", details: err.message });
  }
});

// Nouvel endpoint dédié : CoinGecko tickers via proxy (évite CORS et simplifie l'appel)
app.get("/proxy/coingecko-tickers", async (req, res) => {
  const { symbol } = req.query;
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}/tickers`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const json = await response.json();
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: "Erreur CoinGecko tickers", details: err.message });
  }
});

// CoinPaprika tickers
app.get("/proxy/coinpaprika", async (_, res) => {
  try {
    const response = await fetch("https://api.coinpaprika.com/v1/tickers");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur CoinPaprika", details: err.message });
  }
});

// Nouvel endpoint pour récupérer les marchés CoinPaprika
app.get("/proxy/coinpaprika-markets", async (req, res) => {
  const { id } = req.query;
  try {
    const response = await fetch(
      `https://api.coinpaprika.com/v1/coins/${id}/markets`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json([]);
  }
});

// Finnhub (actions)
app.get("/proxy/finnhub", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur Finnhub", details: err.message });
  }
});

// Binance (crypto)
app.get("/proxy/binance", async (req, res) => {
  const { symbol } = req.query;
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur Binance", details: err.message });
  }
});

// NewsAPI
app.get("/proxy/news", async (req, res) => {
  const { q } = req.query;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&apiKey=${process.env.NEWS_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur NewsAPI", details: err.message });
  }
});

// Taapi RSI / MACD
app.get("/proxy/rsi", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://api.taapi.io/rsi?secret=${process.env.TAAPI_KEY}&exchange=binance&symbol=${symbol}/USDT&interval=1h`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur RSI", details: err.message });
  }
});

app.get("/proxy/macd", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://api.taapi.io/macd?secret=${process.env.TAAPI_KEY}&exchange=binance&symbol=${symbol}/USDT&interval=1h`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur MACD", details: err.message });
  }
});

// CoinMarketCal events
app.get("/proxy/events", async (req, res) => {
  const { coins } = req.query;
  const url = `https://developers.coinmarketcal.com/v1/events?coins=${encodeURIComponent(coins)}`;
  try {
    const response = await fetch(url, {
      headers: { Authorization: process.env.COINMARKETCAL_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur Events", details: err.message });
  }
});

// TokenTerminal on-chain
app.get("/proxy/onchain", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://api.tokenterminal.com/v2/projects/${symbol}/metrics/active_addresses_24h`;
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.TOKEN_TERMINAL_KEY}` }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur On-chain", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
