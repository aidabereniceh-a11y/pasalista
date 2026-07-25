export const runtime = "edge";

export async function POST(request: Request) {
  const { maestroId, maestroEmail } = await request.json();

  const preference = {
    items: [
      {
        title: "Asistencia QR Escolar - Plan Premium (1 mes)",
        quantity: 1,
        unit_price: 35,
        currency_id: "MXN",
      },
    ],
    payer: {
      email: maestroEmail,
    },
    back_urls: {
      success: "https://pasalista.mx/pago/exitoso?maestro=" + maestroId,
      failure: "https://pasalista.mx/pago/fallido",
      pending: "https://pasalista.mx/pago/pendiente",
    },
    auto_return: "approved",
    external_reference: String(maestroId),
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(preference),
  });

  const data = await response.json();
  return Response.json({ url: data.init_point });
}