export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { grupoId, grupoNombre, maestroId } = body;

    if (!grupoId || !grupoNombre || !maestroId) {
      return Response.json({ error: "Faltan datos", body }, { status: 400 });
    }

    const preference = {
      items: [
        {
          id: String(grupoId),
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

    if (!data.init_point) {
      return Response.json({ error: "MercadoPago no devolvio init_point", mp_error: data }, { status: 500 });
    }

    return Response.json({ url: data.init_point });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}