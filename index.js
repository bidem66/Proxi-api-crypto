// index.js
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => res.send("Proxy API is running"));

// Finnhub
app.get("/proxy/finnhub", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

// News API
app.get("/proxy/news", async (req, res) => {
  const { q } = req.query;
  const url = `https://newsapi.org/v2/everything?q=${q}&language=en&apiKey=${process.env.NEWS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

// TAAPI RSI
app.get("/proxy/rsi", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://api.taapi.io/rsi?secret=${process.env.TAAPI_KEY}&exchange=binance&symbol=${symbol}/USDT&interval=1h`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

// TAAPI MACD
app.get("/proxy/macd", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://api.taapi.io/macd?secret=${process.env.TAAPI_KEY}&exchange=binance&symbol=${symbol}/USDT&interval=1h`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

// LunarCrush
app.get("/proxy/lunar", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://lunarcrush.com/api3/coins?symbol=${symbol}&key=${process.env.LUNAR_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

// CoinMarketCal
app.get("/proxy/events", async (req, res) => {
  const { coins } = req.query;
  const url = `https://developers.coinmarketcal.com/v1/events?coins=${coins}`;
  const response = await fetch(url, {
    headers: { Authorization: process.env.COINMARKETCAL_KEY },
  });
  const data = await response.json();
  res.json(data);
});

// Token Terminal
app.get("/proxy/onchain", async (req, res) => {
  const { symbol } = req.query;
  const url = `https://api.tokenterminal.com/v2/projects/${symbol}/metrics/active_addresses_24h`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.TOKEN_TERMINAL_KEY}` },
  });
  const data = await response.json();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
