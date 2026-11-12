import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const runtime = 'edge';

// GET /api/evaluaciones/[id]/calificaciones
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { data, error } = await supabaseAdmin
    .from("calificaciones")
    .select("alumno_id, calificacion, observacion")
    .eq("evaluacion_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST /api/evaluaciones/[id]/calificaciones
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { calificaciones } = await req.json();

  if (!Array.isArray(calificaciones)) {
    return NextResponse.json({ error: "calificaciones debe ser un array" }, { status: 400 });
  }

  // Upsert por evaluacion_id + alumno_id
  const rows = calificaciones.map((c: any) => ({
    evaluacion_id: Number(id),
    alumno_id: c.alumnoId,
    calificacion: c.calificacion,
    observacion: c.observacion || "",
  }));

  const { error } = await supabaseAdmin
    .from("calificaciones")
    .upsert(rows, { onConflict: "evaluacion_id,alumno_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
