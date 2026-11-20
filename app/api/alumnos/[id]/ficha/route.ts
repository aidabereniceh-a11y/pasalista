// Colocar en: app/api/alumnos/[id]/ficha/route.ts
export const runtime = "edge";

import { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alumnoId = parseInt(id, 10);
  if (isNaN(alumnoId)) {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  const { maestroId, tutor_nombre, tutor_whatsapp, fecha_inscripcion, notas, dias_clase } = await request.json();

  if (!maestroId) {
    return Response.json({ error: "Falta maestroId" }, { status: 400 });
  }

  // Verificar que el alumno pertenece a un grupo de este maestro
  const { data: alumno, error: errorAlumno } = await supabaseAdmin
    .from("alumnos")
    .select("id, grupo_id")
    .eq("id", alumnoId)
    .single();

  if (errorAlumno || !alumno) {
    return Response.json({ error: "Alumno no encontrado" }, { status: 404 });
  }

  const { data: grupo } = await supabaseAdmin
    .from("grupos")
    .select("maestro_id")
    .eq("id", (alumno as any).grupo_id)
    .single();

  if (!grupo || String(grupo.maestro_id) !== String(maestroId)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  // Limpiar WhatsApp: solo dígitos, máx 10
  const waLimpio = typeof tutor_whatsapp === "string"
    ? tutor_whatsapp.replace(/\D/g, "").slice(0, 10)
    : null;

  // Limpiar días de clase: array de strings válidos
  const diasValidos = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const diasLimpios = Array.isArray(dias_clase)
    ? dias_clase.filter((d: string) => diasValidos.includes(d))
    : null;

  const { error: errorUpdate } = await supabaseAdmin
    .from("alumnos")
    .update({
      tutor_nombre: tutor_nombre || null,
      tutor_whatsapp: waLimpio || null,
      fecha_inscripcion: fecha_inscripcion || null,
      notas: notas || null,
      ...(diasLimpios !== null ? { dias_clase: diasLimpios } : {}),
    })
    .eq("id", alumnoId);

  if (errorUpdate) {
    return Response.json({ error: "Error al guardar" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alumnoId = parseInt(id, 10);
  if (isNaN(alumnoId)) {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const maestroId = searchParams.get("maestroId");

  if (!maestroId) {
    return Response.json({ error: "Falta maestroId" }, { status: 400 });
  }

  const { data: alumno, error } = await supabaseAdmin
    .from("alumnos")
    .select("id, nombre, tutor_nombre, tutor_whatsapp, fecha_inscripcion, notas, dias_clase, grupo_id")
    .eq("id", alumnoId)
    .single();

  if (error || !alumno) {
    return Response.json({ error: "Alumno no encontrado" }, { status: 404 });
  }

  const { data: grupo } = await supabaseAdmin
    .from("grupos")
    .select("maestro_id")
    .eq("id", (alumno as any).grupo_id)
    .single();

  if (!grupo || String(grupo.maestro_id) !== String(maestroId)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  return Response.json({
    alumno: {
      id: alumno.id,
      nombre: alumno.nombre,
      tutor_nombre: (alumno as any).tutor_nombre,
      tutor_whatsapp: (alumno as any).tutor_whatsapp,
      fecha_inscripcion: (alumno as any).fecha_inscripcion,
      notas: (alumno as any).notas,
      dias_clase: (alumno as any).dias_clase || [],
    },
  });
}
