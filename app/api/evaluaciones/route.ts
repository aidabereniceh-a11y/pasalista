import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const maestroId = searchParams.get("maestroId");
  const grupoId = searchParams.get("grupoId");

  if (!maestroId) {
    return NextResponse.json({ error: "maestroId requerido" }, { status: 400 });
  }

  let query = supabaseAdmin
    .from("evaluaciones")
    .select("*, grupos(nombre, grado, grupo)")
    .eq("grupos.maestro_id", maestroId)
    .order("fecha", { ascending: false });

  if (grupoId) {
    query = query.eq("grupo_id", grupoId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ evaluaciones: data || [] });
}

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
    .from("evaluaciones")
    .insert({
      grupo_id: grupoId,
      nombre,
      fecha: fecha || new Date().toISOString().split("T")[0],
      tipo: tipo || "tarea",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ evaluacion: data });
}