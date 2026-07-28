export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { maestroId } = await request.json();
  const { id: grupoId } = await params;

  if (!maestroId) {
    return Response.json({ error: "Falta maestroId" }, { status: 400 });
  }

  // Verifica que el grupo pertenezca a este maestro antes de borrar nada
  const { data: grupoData } = await supabaseAdmin
    .from("grupos")
    .select("id, maestro_id")
    .eq("id", grupoId)
    .single();

  if (!grupoData || String(grupoData.maestro_id) !== String(maestroId)) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const { data: alumnosDelGrupo } = await supabaseAdmin
    .from("alumnos")
    .select("id")
    .eq("grupo_id", grupoId);

  const idsAlumnos = (alumnosDelGrupo || []).map((a) => a.id);

  if (idsAlumnos.length > 0) {
    await supabaseAdmin.from("asistencia").delete().in("alumno_id", idsAlumnos);
  }
  await supabaseAdmin.from("alumnos").delete().eq("grupo_id", grupoId);
  await supabaseAdmin.from("grupos").delete().eq("id", grupoId);

  return Response.json({ ok: true });
}