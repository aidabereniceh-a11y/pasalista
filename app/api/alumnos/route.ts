export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

async function verificarDueno(grupoId: string, maestroId: string) {
  const { data: grupo } = await supabaseAdmin
    .from("grupos")
    .select("id, maestro_id")
    .eq("id", grupoId)
    .single();

  return !!grupo && String(grupo.maestro_id) === String(maestroId);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grupoId = searchParams.get("grupoId");
  const maestroId = searchParams.get("maestroId");

  if (!grupoId || !maestroId) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  const esDueno = await verificarDueno(grupoId, maestroId);
  if (!esDueno) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("alumnos")
    .select("*")
    .eq("grupo_id", grupoId)
    .order("nombre");

  if (error) {
    return Response.json({ error: "Error al leer alumnos" }, { status: 500 });
  }

  return Response.json({ alumnos: data });
}

export async function POST(request: Request) {
  const { grupoId, maestroId, nombres } = await request.json();

  if (!grupoId || !maestroId || !Array.isArray(nombres)) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  const esDueno = await verificarDueno(grupoId, maestroId);
  if (!esDueno) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const listaAlumnos = nombres
    .map((n: string) => n.trim().toUpperCase())
    .filter((n: string) => n.length > 0)
    .map((nombre: string) => ({ grupo_id: grupoId, nombre, activo: true }));

  if (listaAlumnos.length === 0) {
    return Response.json({ error: "No hay nombres validos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("alumnos")
    .insert(listaAlumnos)
    .select();

  if (error) {
    return Response.json({ error: "Error al agregar alumnos" }, { status: 500 });
  }

  return Response.json({ alumnos: data });
}