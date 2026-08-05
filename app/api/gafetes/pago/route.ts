export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { grupoId, grupoNombre, maestroId } = body;
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      return Response.json({ error: "Token no configurado" }, { status: 500 });
    }

    if (!grupoId || !grupoNombre || !maestroId) {
      return Response.json({ error: "Faltan datos" }, { status: 400 });
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

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json({ error: "MP no es JSON", raw: text }, { status: 500 });
    }

    if (!data.init_point) {
      return Response.json({ error: "Sin init_point", mp_error: data }, { status: 500 });
    }

    return Response.json({ url: data.init_point });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}