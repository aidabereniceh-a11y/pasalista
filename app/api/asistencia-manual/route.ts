// Colocar en: app/api/asistencia-manual/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { grupoEstaBloqueado } from "../../../lib/planLimits";
import { hoyMX, esFechaValida, rangoDiaMX, horaRegistroDiaPasado } from "../../../lib/fechasMX";

const ESTATUS_VALIDOS = ["Presente", "Ausente", "Retardo", "Justificado"];

// POST { alumnoId, grupoId, maestroId, accion, fecha? }
// "fecha" (YYYY-MM-DD) permite corregir un día anterior. Sin fecha = hoy.
export async function POST(request: Request) {
  const { alumnoId, grupoId, maestroId, accion, fecha } = await request.json();

  if (!alumnoId || !grupoId || !maestroId || !accion) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }
  if (!ESTATUS_VALIDOS.includes(accion)) {
    return Response.json({ error: "Estatus invalido" }, { status: 400 });
  }

  const hoy = hoyMX();
  if (fecha !== undefined && fecha !== null && !esFechaValida(fecha)) {
    return Response.json({ error: "Fecha invalida" }, { status: 400 });
  }
  const dia: string = esFechaValida(fecha) ? fecha : hoy;
  if (dia > hoy) {
    return Response.json({ error: "No se puede registrar asistencia en una fecha futura" }, { status: 400 });
  }
  const esHoy = dia === hoy;

  // Verifica que el grupo sea del maestro que hace la peticion
  const { data: grupo, error: errorGrupo } = await supabaseAdmin
    .from("grupos")
    .select("maestro_id")
    .eq("id", grupoId)
    .single();

  if (errorGrupo || !grupo || String(grupo.maestro_id) !== String(maestroId)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  // Plan gratis con mas de 1 grupo: solo el mas antiguo puede tomar asistencia
  if (await grupoEstaBloqueado(grupoId, maestroId)) {
    return Response.json(
      { error: "Este grupo esta bloqueado. Actualiza a Premium para seguir usandolo." },
      { status: 403 }
    );
  }

  const { inicio, fin } = rangoDiaMX(dia);

  // Borra el estatus anterior de ESE día (si existe) para no acumular duplicados.
  // No toca los registros de "Salida al banio" / "Regreso del banio".
  const { error: errorBorrar } = await supabaseAdmin
    .from("asistencia")
    .delete()
    .eq("alumno_id", alumnoId)
    .eq("grupo_id", grupoId)
    .gte("fecha", inicio)
    .lt("fecha", fin)
    .in("accion", ESTATUS_VALIDOS);

  if (errorBorrar) {
    return Response.json({ error: "Error al actualizar, intenta de nuevo" }, { status: 500 });
  }

  // Hoy: hora actual. Día pasado: 8:00 am de ese día (hora de México).
  const fechaRegistro = esHoy ? new Date().toISOString() : horaRegistroDiaPasado(dia);

  const { error } = await supabaseAdmin
    .from("asistencia")
    .insert({ alumno_id: alumnoId, grupo_id: grupoId, accion, fecha: fechaRegistro });

  if (error) {
    return Response.json({ error: "Error al registrar, intenta de nuevo" }, { status: 500 });
  }

  return Response.json({ ok: true, fecha: dia });
}