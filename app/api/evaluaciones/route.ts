// Colocar en: app/api/evaluaciones/route.ts
export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/evaluaciones?grupo_id=123&maestro_id=40&trimestre=1
// Devuelve todas las evaluaciones del grupo para ese trimestre (todas las materias y alumnos)
export async function GET(req: NextRequest) {
  const grupoId = req.nextUrl.searchParams.get("grupo_id");
  const maestroId = req.nextUrl.searchParams.get("maestro_id");
  const trimestre = req.nextUrl.searchParams.get("trimestre");

  if (!grupoId || !maestroId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { data: grupo, error: errorGrupo } = await supabaseAdmin
    .from("grupos")
    .select("id, maestro_id")
    .eq("id", grupoId)
    .single();

  if (errorGrupo || !grupo || String(grupo.maestro_id) !== String(maestroId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let query = supabaseAdmin.from("evaluaciones").select("*").eq("grupo_id", grupoId);
  if (trimestre) {
    query = query.eq("trimestre", Number(trimestre));
  }

  const { data, error } = await query.order("fecha", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST crea una evaluación nueva
// { grupo_id, alumno_id, materia_id, maestro_id, trimestre, tipo: 'numerica'|'comentario', valor_numerico?, comentario?, fecha? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    grupo_id,
    alumno_id,
    materia_id,
    maestro_id,
    trimestre,
    tipo,
    valor_numerico,
    comentario,
    fecha,
  } = body;

  if (!grupo_id || !alumno_id || !materia_id || !maestro_id || !trimestre || !tipo) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  if (tipo === "numerica" && (valor_numerico === undefined || valor_numerico === null)) {
    return NextResponse.json({ error: "Falta el valor numérico" }, { status: 400 });
  }
  if (tipo === "comentario" && !comentario) {
    return NextResponse.json({ error: "Falta el comentario" }, { status: 400 });
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
    .from("evaluaciones")
    .insert({
      grupo_id,
      alumno_id,
      materia_id,
      maestro_id,
      trimestre,
      tipo,
      valor_numerico: tipo === "numerica" ? valor_numerico : null,
      comentario: tipo === "comentario" ? comentario : null,
      fecha: fecha || new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// PUT edita una evaluación existente
// { id, maestro_id, valor_numerico?, comentario?, fecha? }
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, maestro_id, valor_numerico, comentario, fecha } = body;

  if (!id || !maestro_id) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { data: existente, error: errorExistente } = await supabaseAdmin
    .from("evaluaciones")
    .select("id, maestro_id, tipo")
    .eq("id", id)
    .single();

  if (errorExistente || !existente || String(existente.maestro_id) !== String(maestro_id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const cambios: Record<string, unknown> = {};
  if (existente.tipo === "numerica" && valor_numerico !== undefined) {
    cambios.valor_numerico = valor_numerico;
  }
  if (existente.tipo === "comentario" && comentario !== undefined) {
    cambios.comentario = comentario;
  }
  if (fecha) cambios.fecha = fecha;

  const { data, error } = await supabaseAdmin
    .from("evaluaciones")
    .update(cambios)
    .eq("id", id)
    .eq("maestro_id", maestro_id)
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

  const { data: existente, error: errorExistente } = await supabaseAdmin
    .from("evaluaciones")
    .select("id, maestro_id")
    .eq("id", id)
    .single();

  if (errorExistente || !existente || String(existente.maestro_id) !== String(maestro_id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from("evaluaciones").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
