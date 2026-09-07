// Colocar en: app/api/bitacora/route.ts
export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { maestro_id: maestroId, grupo_id, alumno_nombre, fecha, situaciones, descripcion, accion, notifico_padres } = body;

  if (!maestroId) {
    return NextResponse.json({ error: "Falta maestro_id" }, { status: 401 });
  }
  if (!fecha) {
    return NextResponse.json({ error: "Falta la fecha" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("bitacora_incidencias")
    .insert({
      maestro_id: maestroId,
      grupo_id,
      alumno_nombre,
      fecha,
      situaciones,
      descripcion,
      accion,
      notifico_padres: !!notifico_padres,
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
  const { id, maestro_id: maestroId, grupo_id, alumno_nombre, fecha, situaciones, descripcion, accion, notifico_padres } = body;

  if (!id || !maestroId) {
    return NextResponse.json({ error: "Falta id o maestro_id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("bitacora_incidencias")
    .update({
      grupo_id,
      alumno_nombre,
      fecha,
      situaciones,
      descripcion,
      accion,
      notifico_padres: !!notifico_padres,
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
    .from("bitacora_incidencias")
    .select("*")
    .eq("maestro_id", maestroId)
    .order("fecha", { ascending: false })
    .limit(60);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}