const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).send("Erreur serveur proxy");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Proxy démarré sur port ${PORT}`));
