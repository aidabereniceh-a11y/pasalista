export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  const { maestroId } = await request.json();

  if (!maestroId) {
    return Response.json({ error: "Falta maestroId" }, { status: 400 });
  }

  const { data: maestro, error } = await supabaseAdmin
    .from("maestros")
    .select("*")
    .eq("id", maestroId)
    .single();

  if (error || !maestro) {
    return Response.json({ error: "Maestro no encontrado" }, { status: 404 });
  }

  if (maestro.plan === "premium" && maestro.premium_hasta) {
    const vencio = new Date(maestro.premium_hasta) < new Date();
    if (vencio) {
      await supabaseAdmin
        .from("maestros")
        .update({ plan: "gratis", premium_hasta: null, preapproval_id: null })
        .eq("id", maestroId);

      maestro.plan = "gratis";
      maestro.premium_hasta = null;
      maestro.preapproval_id = null;
    }
  }

  const { password: _omitido, ...maestroSinPassword } = maestro;
  return Response.json({ maestro: maestroSinPassword });
}