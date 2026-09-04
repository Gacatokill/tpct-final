export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { nom, tel, email, adresse, produits, total } = body;

    // Créer la commande dans Shopify via API Admin
    const lineItems = produits.map(p => ({
      title: p.title,
      price: p.price.toFixed(2),
      quantity: p.qte,
      requires_shipping: true
    }));

    const orderData = {
      order: {
        line_items: lineItems,
        customer: {
          first_name: nom.split(' ')[0] || nom,
          last_name: nom.split(' ').slice(1).join(' ') || '',
          phone: tel,
          email: email || ''
        },
        shipping_address: {
          name: nom,
          address1: adresse,
          phone: tel
        },
        financial_status: 'pending',
        gateway: 'Espèces à la livraison',
        note: `Commande TPCT - Paiement espèces à la livraison - ${adresse}`,
        tags: 'TPCT, Espèces, Livraison',
        send_receipt: false,
        send_fulfillment_receipt: false
      }
    };

    const response = await fetch(
      'https://jaime-les-raviolis.myshopify.com/admin/api/2026-07/orders.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN
        },
        body: JSON.stringify(orderData)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Shopify error:', result);
      return new Response(JSON.stringify({ error: 'Erreur Shopify', details: result }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({ ok: true, orderId: result.order?.id }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};

export const config = { path: '/api/create-order' };
