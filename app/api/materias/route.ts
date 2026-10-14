// Colocar en: app/api/materias/route.ts
export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/materias?grupo_id=123&maestro_id=40
export async function GET(req: NextRequest) {
  const grupoId = req.nextUrl.searchParams.get("grupo_id");
  const maestroId = req.nextUrl.searchParams.get("maestro_id");

  if (!grupoId || !maestroId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Validar que el grupo pertenezca a este maestro
  const { data: grupo, error: errorGrupo } = await supabaseAdmin
    .from("grupos")
    .select("id, maestro_id")
    .eq("id", grupoId)
    .single();

  if (errorGrupo || !grupo || String(grupo.maestro_id) !== String(maestroId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("materias")
    .select("*")
    .eq("grupo_id", grupoId)
    .order("nombre");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST { grupo_id, maestro_id, nombre }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { grupo_id, maestro_id, nombre } = body;

  if (!grupo_id || !maestro_id || !nombre) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { data: grupo, error: errorGrupo } = await supabaseAdmin
    .from("grupos")
    .select("id, maestro_id")
    .eq("id", grupo_id)
    .single();

  if (errorGrupo || !grupo || String(grupo.maestro_id) !== String(maestro_id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("materias")
    .insert({ grupo_id, maestro_id, nombre: nombre.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE { id, maestro_id }
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id, maestro_id } = body;

  if (!id || !maestro_id) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { data: materia, error: errorMateria } = await supabaseAdmin
    .from("materias")
    .select("id, maestro_id")
    .eq("id", id)
    .single();

  if (errorMateria || !materia || String(materia.maestro_id) !== String(maestro_id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Al borrar la materia se borran en cascada sus evaluaciones (on delete cascade)
  const { error } = await supabaseAdmin.from("materias").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}