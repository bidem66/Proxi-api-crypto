// index.js (complet avec cache CoinGecko + User-Agent)
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Autoriser les requêtes CORS depuis votre frontend GitHub Pages
app.use(cors({
  origin: 'https://bidem66.github.io'
}));

app.get("/", (_, res) => res.send("Proxy API is running"));

// ======== CoinGecko Proxy avec cache + User-Agent ========
const coingeckoCache = new Map();
const COINGECKO_TTL = 2 * 60 * 1000; // 2 minutes

app.get("/proxy/coingecko", async (req, res) => {
  const { endpoint = "", ...params } = req.query;
  const query = new URLSearchParams(params).toString();
  const url = `https://api.coingecko.com/api/v3/${endpoint}?${query}`;
  const cacheKey = `${endpoint}?${query}`;
  const now = Date.now();

  if (coingeckoCache.has(cacheKey)) {
    const { data, timestamp } = coingeckoCache.get(cacheKey);
    if (now - timestamp < COINGECKO_TTL) {
      return res.json(data);
    }
    coingeckoCache.delete(cacheKey);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DashboardApp/1.0; +https://bidem66.github.io)'
      }
    });
    const data = await response.json();
    coingeckoCache.set(cacheKey, { data, timestamp: now });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur CoinGecko", details: err.message });
  }
});

// ======== Autres routes proxy ========

app.get("/proxy/finnhub", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.get("/proxy/news", async (req, res) => {
  const { q } = req.query;
  const url = `https://newsapi.org/v2/everything?q=${q}&language=en&apiKey=${process.env.NEWS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.get("/proxy/rsi", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://api.taapi.io/rsi?secret=${process.env.TAAPI_KEY}&exchange=binance&symbol=${symbol}/USDT&interval=1h`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.get("/proxy/macd", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://api.taapi.io/macd?secret=${process.env.TAAPI_KEY}&exchange=binance&symbol=${symbol}/USDT&interval=1h`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.get("/proxy/events", async (req, res) => {
  const { coins } = req.query;
  const url = `https://developers.coinmarketcal.com/v1/events?coins=${coins}`;
  const response = await fetch(url, {
    headers: { Authorization: process.env.COINMARKETCAL_KEY },
  });
  const data = await response.json();
  res.json(data);
});

app.get("/proxy/onchain", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://api.tokenterminal.com/v2/projects/${symbol}/metrics/active_addresses_24h`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.TOKEN_TERMINAL_KEY}` },
  });
  const data = await response.json();
  res.json(data);
});

// Catch-all proxy
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing url param");
  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
