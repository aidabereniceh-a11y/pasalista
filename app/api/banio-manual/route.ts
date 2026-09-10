// Colocar en: app/api/banio-manual/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  const { alumnoId, grupoId, maestroId, accion } = await request.json();

  if (!alumnoId || !grupoId || !maestroId || !accion) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }
  if (accion !== "Salida al banio" && accion !== "Regreso del banio") {
    return Response.json({ error: "Accion invalida" }, { status: 400 });
  }

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

  const { data: registrosHoy } = await supabaseAdmin
    .from("asistencia")
    .select("*")
    .eq("alumno_id", alumnoId)
    .eq("grupo_id", grupoId)
    .gte("fecha", inicio)
    .order("fecha", { ascending: false });

  const ultimaAccion = registrosHoy && registrosHoy.length > 0 ? registrosHoy[0].accion : "";
  const presenteHoy = registrosHoy ? registrosHoy.some((r: any) => r.accion === "Presente") : false;

  if (!presenteHoy) {
    return Response.json({ error: "El alumno no esta marcado como presente hoy" }, { status: 409 });
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

  return Response.json({ ok: true });
}