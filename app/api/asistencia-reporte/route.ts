// Colocar en: app/api/asistencia-reporte/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grupoId = searchParams.get("grupoId");
  const maestroId = searchParams.get("maestroId");
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  if (!grupoId || !maestroId || !desde || !hasta) {
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
    .eq("activo", true)
    .order("nombre");

  const { data: asistencias } = await supabaseAdmin
    .from("asistencia")
    .select("*")
    .eq("grupo_id", grupoId)
    .gte("fecha", desde)
    .lte("fecha", hasta);

  return Response.json({
    grupo,
    alumnos: alumnos || [],
    asistencias: asistencias || [],
  });
}