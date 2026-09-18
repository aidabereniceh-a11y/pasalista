export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  const { maestroId, maestroEmail } = await request.json();

  const { data: maestro } = await supabaseAdmin
    .from("maestros")
    .select("nombre")
    .eq("id", maestroId)
    .single();

  const nombreCompleto = (maestro?.nombre || "").trim();
  const partes = nombreCompleto.split(/\s+/);
  const firstName = partes[0] || "Maestro";
  const lastName = partes.slice(1).join(" ") || "Sin apellido";

  const preapproval = {
    reason: "Asistencia QR Escolar - Plan Premium (suscripcion mensual)",
    external_reference: String(maestroId),
    payer_email: maestroEmail,
    payer_first_name: firstName,
    payer_last_name: lastName,
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