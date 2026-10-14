// Colocar en: app/api/tareas-entregas/route.ts
export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/tareas-entregas?grupo_id=123&maestro_id=40&trimestre=1
// Devuelve todas las entregas de las tareas de ese grupo/trimestre (para armar el recuento por alumno).
export async function GET(req: NextRequest) {
  const grupoId = req.nextUrl.searchParams.get("grupo_id");
  const maestroId = req.nextUrl.searchParams.get("maestro_id");
  const trimestre = req.nextUrl.searchParams.get("trimestre");

  if (!grupoId || !maestroId || !trimestre) {
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

  const { data: tareas } = await supabaseAdmin
    .from("tareas")
    .select("id")
    .eq("grupo_id", grupoId)
    .eq("trimestre", Number(trimestre));

  const tareaIds = (tareas || []).map((t) => t.id);
  if (!tareaIds.length) return NextResponse.json([]);

  const { data, error } = await supabaseAdmin
    .from("tareas_entregas")
    .select("*")
    .in("tarea_id", tareaIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

// PUT { tarea_id, alumno_id, maestro_id, entregada, fecha_entrega? }
// Marca/desmarca la entrega de un alumno para una tarea.
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { tarea_id, alumno_id, maestro_id, entregada, fecha_entrega } = body;

  if (!tarea_id || !alumno_id || !maestro_id || entregada === undefined) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { data: tarea, error: errorTarea } = await supabaseAdmin
    .from("tareas")
    .select("id, maestro_id")
    .eq("id", tarea_id)
    .single();

  if (errorTarea || !tarea || String(tarea.maestro_id) !== String(maestro_id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("tareas_entregas")
    .upsert(
      {
        tarea_id,
        alumno_id,
        entregada,
        fecha_entrega: entregada ? fecha_entrega || new Date().toISOString().slice(0, 10) : null,
      },
      { onConflict: "tarea_id,alumno_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
