import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: evaluacionId } = await context.params;

  const { data, error } = await supabaseAdmin
    .from("calificaciones")
    .select("*, alumnos(id, nombre)")
    .eq("evaluacion_id", evaluacionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: evaluacionId } = await context.params;
  const { calificaciones } = await req.json();

  if (!calificaciones || !Array.isArray(calificaciones)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  const rows = calificaciones.map((c: { alumnoId: number; calificacion: number; observacion?: string }) => ({
    evaluacion_id: Number(evaluacionId),
    alumno_id: c.alumnoId,
    calificacion: c.calificacion,
    observacion: c.observacion || null,
  }));

  const { data, error } = await supabaseAdmin
    .from("calificaciones")
    .upsert(rows, { onConflict: "evaluacion_id,alumno_id" })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}