import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const grupoId = searchParams.get("grupoId");
  const periodo = searchParams.get("periodo");

  if (!grupoId || !periodo) {
    return NextResponse.json({ error: "grupoId y periodo requeridos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("conducta")
    .select("id, alumno_id, periodo, comentarios, observacion")
    .eq("grupo_id", grupoId)
    .eq("periodo", periodo);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { alumnoId, grupoId, periodo, comentarios, observacion } = body;

  if (!alumnoId || !grupoId || !periodo) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  // Buscar si ya existe
  const { data: existing } = await supabaseAdmin
    .from("conducta")
    .select("id")
    .eq("alumno_id", alumnoId)
    .eq("grupo_id", grupoId)
    .eq("periodo", periodo)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from("conducta")
      .update({ comentarios: comentarios || [], observacion: observacion || "" })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseAdmin
      .from("conducta")
      .insert({
        alumno_id: alumnoId,
        grupo_id: grupoId,
        periodo,
        comentarios: comentarios || [],
        observacion: observacion || "",
      });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
