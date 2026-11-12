import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const alumnoId = searchParams.get("alumnoId");
  const maestroId = searchParams.get("maestroId");

  if (!alumnoId || !maestroId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  // Buscar token existente
  const { data: existing } = await supabaseAdmin
    .from("reporte_tokens")
    .select("token")
    .eq("alumno_id", alumnoId)
    .eq("maestro_id", maestroId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ token: existing.token });
  }

  // Crear nuevo token
  const { data, error } = await supabaseAdmin
    .from("reporte_tokens")
    .insert({ alumno_id: alumnoId, maestro_id: maestroId })
    .select("token")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ token: data.token });
}
