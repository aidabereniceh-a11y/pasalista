// Colocar en: app/api/asistencia-manual/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ESTATUS_VALIDOS = ["Presente", "Ausente", "Retardo", "Justificado"];

export async function POST(request: Request) {
  const { alumnoId, grupoId, maestroId, accion } = await request.json();

  if (!alumnoId || !grupoId || !maestroId || !accion) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }
  if (!ESTATUS_VALIDOS.includes(accion)) {
    return Response.json({ error: "Estatus invalido" }, { status: 400 });
  }

  // Verifica que el grupo sea del maestro que hace la peticion
  const { data: grupo, error: errorGrupo } = await supabaseAdmin
    .from("grupos")
    .select("maestro_id")
    .eq("id", grupoId)
    .single();

  if (errorGrupo || !grupo || String(grupo.maestro_id) !== String(maestroId)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();

  // Borra el estatus anterior de hoy (si existe) para no acumular duplicados.
  // No toca los registros de "Salida al banio" / "Regreso del banio".
  await supabaseAdmin
    .from("asistencia")
    .delete()
    .eq("alumno_id", alumnoId)
    .eq("grupo_id", grupoId)
    .gte("fecha", inicio)
    .in("accion", ESTATUS_VALIDOS);

  const { error } = await supabaseAdmin
    .from("asistencia")
    .insert({ alumno_id: alumnoId, grupo_id: grupoId, accion, fecha: new Date().toISOString() });

  if (error) {
    return Response.json({ error: "Error al registrar, intenta de nuevo" }, { status: 500 });
  }

  return Response.json({ ok: true });
}