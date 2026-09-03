export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { maestroId } = await request.json();
  const { id: alumnoId } = await params;

  if (!maestroId) {
    return Response.json({ error: "Falta maestroId" }, { status: 400 });
  }

  // Verifica que el alumno pertenezca a un grupo de este maestro
  const { data: alumno } = await supabaseAdmin
    .from("alumnos")
    .select("id, grupo_id")
    .eq("id", alumnoId)
    .single();

  if (!alumno) {
    return Response.json({ error: "Alumno no encontrado" }, { status: 404 });
  }

  const { data: grupo } = await supabaseAdmin
    .from("grupos")
    .select("id, maestro_id")
    .eq("id", alumno.grupo_id)
    .single();

  if (!grupo || String(grupo.maestro_id) !== String(maestroId)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  // Dar de baja (no se borra el registro, para conservar el historial de asistencia)
  const { error } = await supabaseAdmin
    .from("alumnos")
    .update({ activo: false })
    .eq("id", alumnoId);

  if (error) {
    return Response.json({ error: "Error al dar de baja" }, { status: 500 });
  }

  return Response.json({ ok: true });
}