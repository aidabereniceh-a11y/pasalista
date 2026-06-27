export const runtime = "edge";

export async function POST(request: Request) {
  const { grupoId, grupoNombre, maestroId } = await request.json();

  const preference = {
    items: [
      {
        title: `Gafetes QR — ${grupoNombre}`,
        quantity: 1,
        unit_price: 99,
        currency_id: "MXN",
      },
    ],
    back_urls: {
      success: `https://pasalista.mx/dashboard?gafetes=ok&grupo=${grupoId}`,
      failure: `https://pasalista.mx/dashboard?gafetes=error`,
      pending: `https://pasalista.mx/dashboard?gafetes=pendiente`,
    },
    auto_return: "approved",
    external_reference: `gafetes_${grupoId}_${maestroId}`,
    notification_url: "https://pasalista.mx/api/gafetes/webhook",
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer APP_USR-3590582654218222-060517-286eaebdef27d1b7ebfe00b397e051d9-3453986570",
    },
    body: JSON.stringify(preference),
  });

  const data = await response.json();
  return Response.json({ url: data.init_point });
}