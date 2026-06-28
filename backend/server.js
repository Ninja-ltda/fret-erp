const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'fret-api-key-2026';

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60000, max: 100, message: { error: 'Rate limit. Aguarde 1 min.' } }));

app.use('/api', (req, res, next) => {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (key !== API_KEY) return res.status(401).json({ error: 'API key inválida' });
  next();
});

app.use('/api', require('./routes/api'));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, '0.0.0.0', () => console.log(`FRET:${PORT} key:${API_KEY}`));