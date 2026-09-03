export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grupoId = searchParams.get("grupoId");
  const maestroId = searchParams.get("maestroId");

  if (!grupoId || !maestroId) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { data: grupo, error: errorGrupo } = await supabaseAdmin
    .from("grupos")
    .select("*")
    .eq("id", grupoId)
    .single();

  if (errorGrupo || !grupo || String(grupo.maestro_id) !== String(maestroId)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

    const { data: alumnos } = await supabaseAdmin
    .from("alumnos")
    .select("*")
    .eq("grupo_id", grupoId)
    .eq("activo", true);

  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();

  const { data: asistencias } = await supabaseAdmin
    .from("asistencia")
    .select("*")
    .eq("grupo_id", grupoId)
    .gte("fecha", inicio);

  return Response.json({
    grupo,
    alumnos: alumnos || [],
    asistencias: asistencias || [],
  });
}