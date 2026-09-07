import { getStore } from "@netlify/blobs";

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

  const store = getStore({ name: "site-config", consistency: "strong" });

  // GET — lire le statut
  if (req.method === 'GET') {
    try {
      const val = await store.get("ouvert");
      return new Response(JSON.stringify({ ouvert: val === "true" }), { headers });
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
      await store.set("ouvert", body.ouvert ? "true" : "false");
      return new Response(JSON.stringify({ ok: true, ouvert: body.ouvert }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};

export const config = { path: '/api/toggle-site' };
