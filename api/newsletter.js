// api/newsletter.js — Vercel Serverless Function
// Reçoit un email, l'ajoute à la liste Brevo de Maison Chalambert
// Variables d'environnement à configurer sur Vercel :
//   BREVO_API_KEY  → clé API Brevo (Paramètres → Clés API → Créer)
//   BREVO_LIST_ID  → ID de ta liste contacts (ex: 2)

export default async function handler(req, res) {
  // CORS — autoriser uniquement depuis le site
  res.setHeader('Access-Control-Allow-Origin', 'https://maisonchalambert.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Méthode non autorisée' });

  const { email } = req.body || {};
  const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!email || !RE_EMAIL.test(email.trim())) {
    return res.status(400).json({ error: 'Adresse email invalide' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '2', 10);

  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY manquante');
    return res.status(500).json({ error: 'Configuration serveur manquante' });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email:         email.trim().toLowerCase(),
        listIds:       [BREVO_LIST_ID],
        updateEnabled: true,   // si le contact existe déjà → pas d'erreur
      }),
    });

    // 201 = nouveau contact, 204 = contact mis à jour → les deux = succès
    if (brevoRes.status === 201 || brevoRes.status === 204) {
      return res.status(200).json({ success: true });
    }

    const data = await brevoRes.json().catch(() => ({}));

    // Code "duplicate_parameter" = contact déjà dans la liste → succès silencieux
    if (data.code === 'duplicate_parameter') {
      return res.status(200).json({ success: true });
    }

    console.error('Brevo erreur:', brevoRes.status, data);
    return res.status(500).json({ error: 'Erreur Brevo' });

  } catch (err) {
    console.error('Newsletter handler error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
