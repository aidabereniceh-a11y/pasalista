import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const runtime = 'edge';

// GET /api/evaluaciones?maestroId=X&grupoId=Y
// Devuelve las tareas del maestro (que son las "evaluaciones" en la UI)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const maestroId = searchParams.get("maestroId");
  const grupoId = searchParams.get("grupoId");

  if (!maestroId) {
    return NextResponse.json({ error: "maestroId requerido" }, { status: 400 });
  }

  let query = supabaseAdmin
    .from("tareas")
    .select("id, grupo_id, titulo, fecha, tipo, trimestre")
    .eq("maestro_id", maestroId)
    .order("fecha", { ascending: false });

  if (grupoId) {
    query = query.eq("grupo_id", grupoId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mapear titulo → nombre para compatibilidad con el frontend
  const evaluaciones = (data || []).map((t: any) => ({
    id: t.id,
    grupo_id: t.grupo_id,
    nombre: t.titulo,
    fecha: t.fecha,
    tipo: t.tipo || "tarea",
    trimestre: t.trimestre,
  }));

  return NextResponse.json({ evaluaciones });
}

// POST /api/evaluaciones
export async function POST(req: NextRequest) {
  const { maestroId, grupoId, nombre, fecha, tipo } = await req.json();

  if (!maestroId || !grupoId || !nombre) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  // Verificar que el grupo pertenece al maestro
  const { data: grupo } = await supabaseAdmin
    .from("grupos")
    .select("id")
    .eq("id", grupoId)
    .eq("maestro_id", maestroId)
    .single();

  if (!grupo) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("tareas")
    .insert({
      grupo_id: grupoId,
      maestro_id: maestroId,
      titulo: nombre,
      fecha: fecha || new Date().toISOString().split("T")[0],
      tipo: tipo || "tarea",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    evaluacion: {
      id: data.id,
      grupo_id: data.grupo_id,
      nombre: data.titulo,
      fecha: data.fecha,
      tipo: data.tipo || "tarea",
    }
  });
}
