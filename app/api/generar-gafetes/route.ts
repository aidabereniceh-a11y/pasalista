export const runtime = "edge";

export async function POST(request: Request) {
  const body = await request.json();
  const { grupoId, grupoNombre, maestroId } = body;
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    return Response.json({ error: "Token no configurado" }, { status: 500 });
  }

  const preference = {
    items: [{
      id: String(grupoId),
      title: "Gafetes QR " + grupoNombre,
      quantity: 1,
      unit_price: 99,
      currency_id: "MXN",
    }],
    back_urls: {
      success: "https://pasalista.mx/dashboard?gafetes=ok&grupo=" + grupoId,
      failure: "https://pasalista.mx/dashboard?gafetes=error",
      pending: "https://pasalista.mx/dashboard?gafetes=pendiente",
    },
    auto_return: "approved",
    external_reference: "gafetes_" + grupoId + "_" + maestroId,
    notification_url: "https://pasalista.mx/api/gafetes/webhook",
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify(preference),
  });

  const data = await response.json();

  if (!data.init_point) {
    return Response.json({ error: "Sin init_point", mp_error: data }, { status: 500 });
  }

  return Response.json({ url: data.init_point });
}