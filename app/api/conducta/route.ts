import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const grupoId = searchParams.get("grupoId");
  const periodo = searchParams.get("periodo");

  if (!grupoId || !periodo) {
    return NextResponse.json({ error: "grupoId y periodo requeridos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("conducta")
    .select("*, alumnos(id, nombre)")
    .eq("grupo_id", grupoId)
    .eq("periodo", periodo);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { alumnoId, grupoId, periodo, comentarios, observacion } = await req.json();

  if (!alumnoId || !grupoId || !periodo) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("conducta")
    .upsert(
      {
        alumno_id: alumnoId,
        grupo_id: grupoId,
        periodo,
        comentarios: comentarios || [],
        observacion: observacion || "",
        actualizado_at: new Date().toISOString(),
      },
      { onConflict: "alumno_id,periodo" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}