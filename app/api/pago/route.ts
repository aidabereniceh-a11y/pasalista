export const runtime = "edge";

export async function POST(request: Request) {
  const { maestroId, maestroEmail } = await request.json();

  const preference = {
    items: [
      {
        title: "Asistencia QR Escolar - Plan Premium",
        quantity: 1,
        unit_price: 499,
        currency_id: "MXN",
      },
    ],
    payer: {
      email: maestroEmail,
    },
    back_urls: {
      success: "https://asistencia.promociondocente.mx/pago/exitoso?maestro=" + maestroId,
      failure: "https://asistencia.promociondocente.mx/pago/fallido",
      pending: "https://asistencia.promociondocente.mx/pago/pendiente",
    },
    auto_return: "approved",
    external_reference: String(maestroId),
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