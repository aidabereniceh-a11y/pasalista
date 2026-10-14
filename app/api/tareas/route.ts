// Colocar en: app/api/tareas/route.ts
export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/tareas?grupo_id=123&maestro_id=40&trimestre=1
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

  let query = supabaseAdmin.from("tareas").select("*").eq("grupo_id", grupoId);
  if (trimestre) query = query.eq("trimestre", Number(trimestre));

  const { data, error } = await query.order("fecha", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST { grupo_id, materia_id?, maestro_id, trimestre, titulo, fecha? }
// Crea la tarea y, de una vez, una fila en tareas_entregas (entregada:false) para cada alumno activo del grupo.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { grupo_id, materia_id, maestro_id, trimestre, titulo, fecha } = body;

  if (!grupo_id || !maestro_id || !trimestre || !titulo) {
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

  const { data: tarea, error: errorTarea } = await supabaseAdmin
    .from("tareas")
    .insert({
      grupo_id,
      materia_id: materia_id || null,
      maestro_id,
      trimestre,
      titulo: titulo.trim(),
      fecha: fecha || new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (errorTarea) {
    return NextResponse.json({ error: errorTarea.message }, { status: 500 });
  }

  const { data: alumnos } = await supabaseAdmin
    .from("alumnos")
    .select("id")
    .eq("grupo_id", grupo_id)
    .eq("activo", true);

  if (alumnos && alumnos.length) {
    await supabaseAdmin.from("tareas_entregas").insert(
      alumnos.map((a) => ({ tarea_id: tarea.id, alumno_id: a.id, entregada: false }))
    );
  }

  return NextResponse.json(tarea);
}

// DELETE { id, maestro_id }
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id, maestro_id } = body;

  if (!id || !maestro_id) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { data: tarea, error: errorTarea } = await supabaseAdmin
    .from("tareas")
    .select("id, maestro_id")
    .eq("id", id)
    .single();

  if (errorTarea || !tarea || String(tarea.maestro_id) !== String(maestro_id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from("tareas").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
