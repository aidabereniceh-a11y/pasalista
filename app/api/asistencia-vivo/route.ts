// Colocar en: app/api/asistencia-vivo/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { grupoEstaBloqueado } from "../../../lib/planLimits";
import { hoyMX, esFechaValida, rangoDiaMX } from "../../../lib/fechasMX";

// GET /api/asistencia-vivo?grupoId=1&maestroId=2&fecha=2026-09-29
// Sin "fecha" regresa la asistencia de hoy (hora de México).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grupoId = searchParams.get("grupoId");
  const maestroId = searchParams.get("maestroId");
  const fechaParam = searchParams.get("fecha");

  if (!grupoId || !maestroId) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  const hoy = hoyMX();
  const dia = esFechaValida(fechaParam) ? fechaParam : hoy;
  if (dia > hoy) {
    return Response.json({ error: "No se puede consultar una fecha futura" }, { status: 400 });
  }

  const { data: grupo, error: errorGrupo } = await supabaseAdmin
    .from("grupos")
    .select("*")
    .eq("id", grupoId)
    .single();

  if (errorGrupo || !grupo || String(grupo.maestro_id) !== String(maestroId)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const bloqueado = await grupoEstaBloqueado(grupoId, maestroId);

  const { data: alumnos } = await supabaseAdmin
    .from("alumnos")
    .select("*")
    .eq("grupo_id", grupoId)
    .eq("activo", true);

  const { inicio, fin } = rangoDiaMX(dia);

  const { data: asistencias } = await supabaseAdmin
    .from("asistencia")
    .select("*")
    .eq("grupo_id", grupoId)
    .gte("fecha", inicio)
    .lt("fecha", fin);

  return Response.json({
    grupo,
    bloqueado,
    fecha: dia,
    esHoy: dia === hoy,
    alumnos: alumnos || [],
    asistencias: asistencias || [],
  });
}