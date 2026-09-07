export default async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  const BIN_ID = process.env.JSONBIN_ID;
  const API_KEY = process.env.JSONBIN_KEY;
  const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  // GET — lire le statut
  if (req.method === 'GET') {
    try {
      const r = await fetch(BIN_URL + '/latest', {
        headers: { 'X-Master-Key': API_KEY }
      });
      const data = await r.json();
      return new Response(JSON.stringify({ ouvert: data.record?.ouvert === true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ ouvert: false }), { headers });
    }
  }

  // POST — modifier le statut
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      if (body.pin !== process.env.ADMIN_PIN) {
        return new Response(JSON.stringify({ error: 'PIN incorrect' }), { status: 401, headers });
      }
      const r = await fetch(BIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ ouvert: body.ouvert })
      });
      const data = await r.json();
      return new Response(JSON.stringify({ ok: true, ouvert: data.record?.ouvert }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};

export const config = { path: '/api/toggle-site' };
