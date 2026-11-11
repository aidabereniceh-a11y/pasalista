import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  // Buscar alumno por token
  const { data: alumno } = await supabaseAdmin
    .from("alumnos")
    .select("id, nombre, grupo_id, grupos(nombre, grado, grupo, maestros(nombre))")
    .eq("reporte_token", token)
    .single();

  if (!alumno) {
    return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
  }

  const grupo = alumno.grupos as any;
  const maestro = grupo?.maestros as any;

  // Asistencia del mes actual
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const { data: asistencia } = await supabaseAdmin
    .from("asistencia")
    .select("fecha, presente")
    .eq("alumno_id", alumno.id)
    .gte("fecha", inicioMes.toISOString());

  const presentes = (asistencia || []).filter(a => a.presente).length;
  const faltas = (asistencia || []).filter(a => !a.presente).length;

  // Calificaciones
  const { data: calificaciones } = await supabaseAdmin
    .from("calificaciones")
    .select("calificacion, observacion, evaluaciones(nombre, fecha)")
    .eq("alumno_id", alumno.id);

  // Conducta (todos los periodos)
  const { data: conducta } = await supabaseAdmin
    .from("conducta")
    .select("periodo, comentarios, observacion")
    .eq("alumno_id", alumno.id)
    .order("periodo");

  return NextResponse.json({
    alumno: alumno.nombre,
    grupo: grupo?.nombre,
    maestro: maestro?.nombre,
    asistencia: { presentes, faltas, total: presentes + faltas },
    calificaciones: (calificaciones || []).map((c: any) => ({
      evaluacion: c.evaluaciones?.nombre,
      fecha: c.evaluaciones?.fecha,
      calificacion: c.calificacion,
      observacion: c.observacion,
    })),
    conducta: conducta || [],
  });
}