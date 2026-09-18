export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  const { maestroId, maestroEmail } = await request.json();

  // Buscamos el nombre completo del maestro para separar nombre y apellido
  const { data: maestro } = await supabaseAdmin
    .from("maestros")
    .select("nombre")
    .eq("id", maestroId)
    .single();

  const nombreCompleto = (maestro?.nombre || "").trim();
  const partes = nombreCompleto.split(/\s+/);
  const firstName = partes[0] || "Maestro";
  const lastName = partes.slice(1).join(" ") || "Sin apellido";

  const preference = {
    items: [
      {
        title: "Asistencia QR Escolar - Plan Premium (1 mes)",
        description: "Suscripcion mensual al Plan Premium de PasaLista: grupos ilimitados, gafetes QR, Diario del Maestro y Bitacora de Incidencias.",
        quantity: 1,
        unit_price: 49,
        currency_id: "MXN",
      },
    ],
    payer: {
      email: maestroEmail,
      first_name: firstName,
      last_name: lastName,
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