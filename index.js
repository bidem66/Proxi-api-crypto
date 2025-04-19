const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'URL manquante dans le paramètre ?url=' });
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur de récupération depuis le proxy', details: err.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy démarré sur le port ${PORT}`);
});
