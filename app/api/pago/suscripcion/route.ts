export const runtime = "edge";

export async function POST(request: Request) {
  const { maestroId, maestroEmail } = await request.json();

  const preapproval = {
    reason: "Asistencia QR Escolar - Plan Premium (suscripcion mensual)",
    external_reference: String(maestroId),
    payer_email: maestroEmail,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: 49,
      currency_id: "MXN",
    },
    back_url: "https://pasalista.mx/pago/exitoso?maestro=" + maestroId,
    status: "pending",
  };

  const response = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(preapproval),
  });

  const data = await response.json();
  return Response.json({ url: data.init_point });
}