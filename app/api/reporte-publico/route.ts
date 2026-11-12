import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

  // Buscar token
  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from("reporte_tokens")
    .select("alumno_id, maestro_id")
    .eq("token", token)
    .maybeSingle();

  if (tokenError || !tokenData) {
    return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
  }

  const { alumno_id, maestro_id } = tokenData;

  // Datos del alumno
  const { data: alumno } = await supabaseAdmin
    .from("alumnos")
    .select("id, nombre, grupo_id")
    .eq("id", alumno_id)
    .maybeSingle();

  // Datos del grupo por separado
  const { data: grupo } = alumno?.grupo_id ? await supabaseAdmin
    .from("grupos")
    .select("id, nombre, grado, grupo, asignatura, etiqueta, turno")
    .eq("id", alumno.grupo_id)
    .maybeSingle() : { data: null };

  // Conducta de todos los periodos
  const { data: conductaRows } = await supabaseAdmin
    .from("conducta")
    .select("periodo, comentarios, observacion")
    .eq("alumno_id", alumno_id)
    .order("creado_at", { ascending: true });

  // Calificaciones — obtener tareas del maestro para este grupo
  const grupoId = alumno?.grupo_id ?? grupo?.id;
  let calificaciones: any[] = [];

  if (grupoId) {
    const { data: tareas } = await supabaseAdmin
      .from("tareas")
      .select("id, titulo, tipo, fecha")
      .eq("grupo_id", grupoId)
      .eq("maestro_id", maestro_id)
      .order("fecha", { ascending: true });

    if (tareas && tareas.length > 0) {
      const tareaIds = tareas.map((t: any) => t.id);
      const { data: cals } = await supabaseAdmin
        .from("calificaciones")
        .select("evaluacion_id, calificacion")
        .eq("alumno_id", alumno_id)
        .in("evaluacion_id", tareaIds);

      calificaciones = tareas.map((t: any) => {
        const cal = (cals || []).find((c: any) => c.evaluacion_id === t.id);
        return {
          tarea: t.titulo,
          tipo: t.tipo || "tarea",
          fecha: t.fecha,
          calificacion: cal?.calificacion ?? null,
        };
      });
    }
  }

  return NextResponse.json({
    alumno: {
      id: alumno?.id,
      nombre: alumno?.nombre,
      grupo: grupo ? {
        nombre: grupo.nombre,
        grado: grupo.grado,
        grupo: grupo.grupo,
        asignatura: grupo.asignatura,
        etiqueta: grupo.etiqueta,
        turno: grupo.turno,
      } : null,
    },
    conductas: conductaRows || [],
    calificaciones,
  });
}
