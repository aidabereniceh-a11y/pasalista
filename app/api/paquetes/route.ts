export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PUT /api/grupos/horario — guardar horario de un grupo
export async function PUT(req: NextRequest) {
  const { grupoId, maestroId, horario_dias, horario_hora } = await req.json();

  if (!grupoId || !maestroId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  // Verificar acceso
  const { data: grupo, error: errGrupo } = await supabase
    .from("grupos")
    .select("id")
    .eq("id", grupoId)
    .eq("maestro_id", maestroId)
    .single();

  if (errGrupo || !grupo) {
    return NextResponse.json({ error: "No tienes acceso a este grupo" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("grupos")
    .update({ horario_dias: horario_dias || [], horario_hora: horario_hora || null })
    .eq("id", grupoId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ grupo: data });
}