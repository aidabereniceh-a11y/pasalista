// Colocar en: app/api/diario/route.ts
export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    maestro_id: maestroId,
    grupo_id,
    fecha,
    componentes,
    actividades,
    logros,
    retos,
    observaciones,
    compromisos,
    autoevaluacion,
  } = body;

  if (!maestroId) {
    return NextResponse.json({ error: "Falta maestro_id" }, { status: 401 });
  }
  if (!fecha) {
    return NextResponse.json({ error: "Falta la fecha" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("diario_maestro")
    .insert({
      maestro_id: maestroId,
      grupo_id,
      fecha,
      componentes,
      actividades,
      logros,
      retos,
      observaciones,
      compromisos,
      autoevaluacion,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const {
    id,
    maestro_id: maestroId,
    grupo_id,
    fecha,
    componentes,
    actividades,
    logros,
    retos,
    observaciones,
    compromisos,
    autoevaluacion,
  } = body;

  if (!id || !maestroId) {
    return NextResponse.json({ error: "Falta id o maestro_id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("diario_maestro")
    .update({
      grupo_id,
      fecha,
      componentes,
      actividades,
      logros,
      retos,
      observaciones,
      compromisos,
      autoevaluacion,
    })
    .eq("id", id)
    .eq("maestro_id", maestroId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const maestroId = req.nextUrl.searchParams.get("maestro_id");
  if (!maestroId) {
    return NextResponse.json({ error: "Falta maestro_id" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("diario_maestro")
    .select("*")
    .eq("maestro_id", maestroId)
    .order("fecha", { ascending: false })
    .limit(60);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}