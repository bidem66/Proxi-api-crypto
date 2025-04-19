// index.js import express from 'express'; import cors from 'cors'; import fetch from 'node-fetch'; import dotenv from 'dotenv';

dotenv.config(); const app = express(); app.use(cors()); app.use(express.json());

const PORT = process.env.PORT || 3000;

// Proxy NewsAPI app.get('/api/news', async (req, res) => { const { q } = req.query; const url = https://newsapi.org/v2/everything?q=${q}&language=en&apiKey=${process.env.NEWS_API_KEY}; try { const result = await fetch(url); const data = await result.json(); res.json(data); } catch { res.status(500).json({ error: "Erreur proxy News API" }); } });

// Proxy TAAPI RSI app.get('/api/rsi', async (req, res) => { const { symbol } = req.query; const url = https://api.taapi.io/rsi?secret=${process.env.TAAPI_KEY}&exchange=binance&symbol=${symbol}/USDT&interval=1h; try { const result = await fetch(url); const data = await result.json(); res.json(data); } catch { res.status(500).json({ error: "Erreur proxy TAAPI RSI" }); } });

// Proxy TAAPI MACD app.get('/api/macd', async (req, res) => { const { symbol } = req.query; const url = https://api.taapi.io/macd?secret=${process.env.TAAPI_KEY}&exchange=binance&symbol=${symbol}/USDT&interval=1h; try { const result = await fetch(url); const data = await result.json(); res.json(data); } catch { res.status(500).json({ error: "Erreur proxy TAAPI MACD" }); } });

// Proxy LunarCrush app.get('/api/social', async (req, res) => { const { symbol } = req.query; const url = https://lunarcrush.com/api3/coins?symbol=${symbol}&key=${process.env.LUNAR_API_KEY}; try { const result = await fetch(url); const data = await result.json(); res.json(data); } catch { res.status(500).json({ error: "Erreur proxy LunarCrush" }); } });

// Proxy CoinMarketCal app.get('/api/events', async (req, res) => { const { symbol } = req.query; const url = https://developers.coinmarketcal.com/v1/events?coins=${symbol}&access_token=${process.env.COINMARKETCAL_KEY}; try { const result = await fetch(url); const data = await result.json(); res.json(data); } catch { res.status(500).json({ error: "Erreur proxy CoinMarketCal" }); } });

// Proxy TokenTerminal app.get('/api/onchain', async (req, res) => { const { symbol } = req.query; const url = https://api.tokenterminal.com/v2/projects/${symbol}/metrics/active_addresses_24h; try { const result = await fetch(url, { headers: { Authorization: Bearer ${process.env.TOKEN_TERMINAL_KEY} } }); const data = await result.json(); res.json(data); } catch { res.status(500).json({ error: "Erreur proxy TokenTerminal" }); } });

app.listen(PORT, () => { console.log(Proxy API running on port ${PORT}); });

