export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  const { maestroId } = await request.json();

  if (!maestroId) {
    return Response.json({ error: "Falta maestroId" }, { status: 400 });
  }

  const { data: maestro, error } = await supabaseAdmin
    .from("maestros")
    .select("preapproval_id")
    .eq("id", maestroId)
    .single();

  if (error || !maestro?.preapproval_id) {
    return Response.json({ error: "No tienes una suscripcion automatica activa" }, { status: 404 });
  }

  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${maestro.preapproval_id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ status: "cancelled" }),
    }
  );

  if (!response.ok) {
    return Response.json({ error: "No se pudo cancelar en MercadoPago" }, { status: 500 });
  }

  await supabaseAdmin
    .from("maestros")
    .update({ preapproval_id: null })
    .eq("id", maestroId);

  return Response.json({ ok: true });
}