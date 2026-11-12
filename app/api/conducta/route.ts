import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const grupoId = searchParams.get("grupoId");
  const periodo = searchParams.get("periodo");
  const alumnoId = searchParams.get("alumnoId"); // para historial individual

  if (!grupoId || !periodo) {
    return NextResponse.json({ error: "grupoId y periodo requeridos" }, { status: 400 });
  }

  // Si piden historial de un alumno específico
  if (alumnoId) {
    const { data, error } = await supabaseAdmin
      .from("conducta_historial")
      .select("id, fecha, comentarios, observacion, creado_at")
      .eq("alumno_id", alumnoId)
      .eq("grupo_id", grupoId)
      .eq("periodo", periodo)
      .order("fecha", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ historial: data || [] });
  }

  // Sin alumnoId: devuelve el estado actual de todos los alumnos del grupo+periodo
  const { data, error } = await supabaseAdmin
    .from("conducta")
    .select("id, alumno_id, periodo, comentarios, observacion")
    .eq("grupo_id", grupoId)
    .eq("periodo", periodo);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { alumnoId, grupoId, periodo, comentarios, observacion } = body;

  if (!alumnoId || !grupoId || !periodo) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. Upsert en conducta (estado actual)
  const { data: existing } = await supabaseAdmin
    .from("conducta")
    .select("id")
    .eq("alumno_id", alumnoId)
    .eq("grupo_id", grupoId)
    .eq("periodo", periodo)
    .maybeSingle();

  let conductaId: number;

  if (existing) {
    // Acumular comentarios sin duplicados
    const { data: current } = await supabaseAdmin
      .from("conducta")
      .select("comentarios")
      .eq("id", existing.id)
      .single();

    const prevComentarios: string[] = current?.comentarios || [];
    const nuevos = comentarios || [];
    const acumulados = Array.from(new Set([...prevComentarios, ...nuevos]));

    const { error } = await supabaseAdmin
      .from("conducta")
      .update({ comentarios: acumulados, observacion: observacion || "" })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    conductaId = existing.id;
  } else {
    const { data: inserted, error } = await supabaseAdmin
      .from("conducta")
      .insert({
        alumno_id: alumnoId,
        grupo_id: grupoId,
        periodo,
        comentarios: comentarios || [],
        observacion: observacion || "",
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    conductaId = inserted.id;
  }

  // 2. Upsert en historial (una entrada por día)
  const { data: hoyEntry } = await supabaseAdmin
    .from("conducta_historial")
    .select("id, comentarios")
    .eq("alumno_id", alumnoId)
    .eq("grupo_id", grupoId)
    .eq("periodo", periodo)
    .eq("fecha", hoy)
    .maybeSingle();

  if (hoyEntry) {
    // Acumular comentarios del día sin duplicados
    const prevHoy: string[] = hoyEntry.comentarios || [];
    const nuevos = comentarios || [];
    const acumuladosHoy = Array.from(new Set([...prevHoy, ...nuevos]));

    await supabaseAdmin
      .from("conducta_historial")
      .update({ comentarios: acumuladosHoy, observacion: observacion || "" })
      .eq("id", hoyEntry.id);
  } else {
    await supabaseAdmin
      .from("conducta_historial")
      .insert({
        conducta_id: conductaId,
        alumno_id: alumnoId,
        grupo_id: grupoId,
        periodo,
        comentarios: comentarios || [],
        observacion: observacion || "",
        fecha: hoy,
      });
  }

  return NextResponse.json({ ok: true });
}
