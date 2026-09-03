export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  const { alumnoNombre, grupoId, accion } = await request.json();

  if (!alumnoNombre || !grupoId || !accion) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
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

  if (accion === "Presente" && presenteHoy) {
    return Response.json({ error: "Asistencia ya registrada hoy" }, { status: 409 });
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

  return Response.json({ ok: true });
}