export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/alumno-paquetes?alumnoId=X — obtener paquete activo del alumno
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const alumnoId = searchParams.get("alumnoId");
  const grupoId = searchParams.get("grupoId");

  if (!alumnoId && !grupoId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  if (alumnoId) {
    const { data, error } = await supabase
      .from("alumno_paquetes")
      .select("*, paquetes(nombre, num_clases, precio)")
      .eq("alumno_id", alumnoId)
      .eq("activo", true)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ alumno_paquete: data || null });
  }

  // Si viene grupoId, traer todos los alumnos del grupo con su paquete
  if (grupoId) {
    // Primero obtener IDs de alumnos del grupo
    const { data: alumnosData, error: errAlumnos } = await supabase
      .from("alumnos")
      .select("id")
      .eq("grupo_id", grupoId)
      .eq("activo", true);

    if (errAlumnos) return NextResponse.json({ error: errAlumnos.message }, { status: 500 });

    const alumnoIds = (alumnosData || []).map((a: any) => a.id);

    if (alumnoIds.length === 0) {
      return NextResponse.json({ alumno_paquetes: [] });
    }

    const { data, error } = await supabase
      .from("alumno_paquetes")
      .select("*, alumnos(id, nombre), paquetes(nombre, num_clases)")
      .eq("activo", true)
      .in("alumno_id", alumnoIds);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ alumno_paquetes: data || [] });
  }
}

// POST /api/alumno-paquetes — asignar paquete a alumno
export async function POST(req: NextRequest) {
  const { alumnoId, paqueteId } = await req.json();

  if (!alumnoId || !paqueteId) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  // Obtener num_clases del paquete
  const { data: paquete, error: errP } = await supabase
    .from("paquetes")
    .select("num_clases")
    .eq("id", paqueteId)
    .single();

  if (errP || !paquete) {
    return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });
  }

  // Desactivar paquete anterior si existe
  await supabase
    .from("alumno_paquetes")
    .update({ activo: false })
    .eq("alumno_id", alumnoId)
    .eq("activo", true);

  // Asignar nuevo paquete
  const { data, error } = await supabase
    .from("alumno_paquetes")
    .insert({
      alumno_id: alumnoId,
      paquete_id: paqueteId,
      clases_restantes: paquete.num_clases,
      fecha_inicio: new Date().toISOString().split("T")[0],
      activo: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ alumno_paquete: data });
}

// PATCH /api/alumno-paquetes — ajuste manual de clases
export async function PATCH(req: NextRequest) {
  const { alumnoId, ajuste } = await req.json();

  if (!alumnoId || ajuste === undefined) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const { data: ap, error: errAp } = await supabase
    .from("alumno_paquetes")
    .select("id, clases_restantes")
    .eq("alumno_id", alumnoId)
    .eq("activo", true)
    .maybeSingle();

  if (errAp || !ap) {
    return NextResponse.json({ error: "El alumno no tiene paquete activo" }, { status: 404 });
  }

  const nuevas = Math.max(0, ap.clases_restantes + ajuste);

  const { data, error } = await supabase
    .from("alumno_paquetes")
    .update({ clases_restantes: nuevas })
    .eq("id", ap.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ alumno_paquete: data });
}