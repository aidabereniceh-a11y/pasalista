export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { grupoEstaBloqueado } from "../../../lib/planLimits";

const ESTATUS_VALIDOS = ["Presente", "Ausente", "Retardo", "Justificado"];

export async function POST(request: Request) {
  const { alumnoNombre, grupoId, accion, maestroId } = await request.json();

  if (!alumnoNombre || !grupoId || !accion || !maestroId) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
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

  // Plan gratis con mas de 1 grupo: solo el mas antiguo puede usar el checkin
  if (await grupoEstaBloqueado(grupoId, maestroId)) {
    return Response.json(
      { error: "Este grupo esta bloqueado. Actualiza a Premium para seguir usandolo." },
      { status: 403 }
    );
  }

  const { data: alumnoData } = await supabaseAdmin
    .from("alumnos")
    .select("id")
    .eq("nombre", alumnoNombre)
    .eq("grupo_id", grupoId)
    .eq("activo", true)
    .single();

  if (!alumnoData) {
    return Response.json({ error: "Alumno no encontrado" }, { status: 404 });
  }

  const alumnoId = alumnoData.id;
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();

  const { data: registrosHoy } = await supabaseAdmin
    .from("asistencia")
    .select("*")
    .eq("alumno_id", alumnoId)
    .eq("grupo_id", grupoId)
    .gte("fecha", inicio)
    .order("fecha", { ascending: false });

  const ultimaAccion = registrosHoy && registrosHoy.length > 0 ? registrosHoy[0].accion : "";
  const presenteHoy = registrosHoy ? registrosHoy.some((r: any) => r.accion === "Presente") : false;

  const yaTieneEstatusHoy = registrosHoy
    ? registrosHoy.some((r: any) => ESTATUS_VALIDOS.includes(r.accion))
    : false;

  if (accion === "Presente" && yaTieneEstatusHoy) {
    return Response.json({ error: "Este alumno ya tiene un estatus registrado hoy" }, { status: 409 });
  }

  if ((accion === "Salida al banio" || accion === "Regreso del banio") && !presenteHoy) {
    return Response.json({ error: "El alumno no ha registrado asistencia hoy" }, { status: 409 });
  }

  if (accion === "Salida al banio" && ultimaAccion === "Salida al banio") {
    return Response.json({ error: "El alumno ya esta fuera del aula" }, { status: 409 });
  }

  if (accion === "Regreso del banio" && ultimaAccion !== "Salida al banio") {
    return Response.json({ error: "No hay salida al banio activa" }, { status: 409 });
  }

  const { error } = await supabaseAdmin
    .from("asistencia")
    .insert({ alumno_id: alumnoId, grupo_id: grupoId, accion, fecha: new Date().toISOString() });

  if (error) {
    return Response.json({ error: "Error al registrar, intenta de nuevo" }, { status: 500 });
  }

  // --- Descuento automático de paquete al registrar "Presente" ---
  if (accion === "Presente") {
    const { data: ap } = await supabaseAdmin
      .from("alumno_paquetes")
      .select("id, clases_restantes")
      .eq("alumno_id", alumnoId)
      .eq("activo", true)
      .maybeSingle();

    if (ap && ap.clases_restantes > 0) {
      await supabaseAdmin
        .from("alumno_paquetes")
        .update({ clases_restantes: ap.clases_restantes - 1 })
        .eq("id", ap.id);
    }
  }
  // --- Fin descuento automático ---

  // Leer clases restantes para incluirlas en la respuesta
  let clasesRestantes: number | null = null;
  if (accion === "Presente") {
    const { data: apActual } = await supabaseAdmin
      .from("alumno_paquetes")
      .select("clases_restantes")
      .eq("alumno_id", alumnoId)
      .eq("activo", true)
      .maybeSingle();
    if (apActual) clasesRestantes = apActual.clases_restantes;
  }

  return Response.json({ ok: true, clases_restantes: clasesRestantes });
}