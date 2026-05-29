// api/newsletter.js — Vercel Serverless Function (CommonJS)
const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Methode non autorisee' });

  const { email } = req.body || {};
  const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!email || !RE_EMAIL.test(String(email).trim())) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '2', 10);

  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'Config manquante' });
  }

  const payload = JSON.stringify({
    email:         String(email).trim().toLowerCase(),
    listIds:       [BREVO_LIST_ID],
    updateEnabled: true,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.brevo.com',
      path:     '/v3/contacts',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Accept':         'application/json',
        'api-key':        BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const reqBrevo = https.request(options, (resBrevo) => {
      let body = '';
      resBrevo.on('data', (chunk) => { body += chunk; });
      resBrevo.on('end', () => {
        const status = resBrevo.statusCode;
        // 201 = nouveau contact créé, 204 = mis à jour
        if (status === 201 || status === 204) {
          res.status(200).json({ success: true });
          return resolve();
        }
        // Contact déjà dans la liste → succès silencieux
        try {
          const data = JSON.parse(body);
          if (data.code === 'duplicate_parameter') {
            res.status(200).json({ success: true });
            return resolve();
          }
        } catch (_) {}
        console.error('Brevo error', status, body);
        res.status(500).json({ error: 'Erreur Brevo ' + status });
        resolve();
      });
    });

    reqBrevo.on('error', (err) => {
      console.error('HTTPS error:', err);
      res.status(500).json({ error: 'Erreur reseau' });
      resolve();
    });

    reqBrevo.write(payload);
    reqBrevo.end();
  });
};
