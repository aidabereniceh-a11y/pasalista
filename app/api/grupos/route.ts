export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maestroId = searchParams.get("maestroId");

  if (!maestroId) {
    return Response.json({ error: "Falta maestroId" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("grupos")
    .select("*")
    .eq("maestro_id", maestroId);

  if (error) {
    return Response.json({ error: "Error al leer grupos" }, { status: 500 });
  }

  return Response.json({ grupos: data });
}

export async function POST(request: Request) {
  const { maestroId, grado, grupo, alumnos } = await request.json();

  if (!maestroId || !grado || !grupo || !Array.isArray(alumnos)) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { data: maestro } = await supabaseAdmin
    .from("maestros")
    .select("plan")
    .eq("id", maestroId)
    .single();

  if (maestro?.plan === "gratis") {
    const { count } = await supabaseAdmin
      .from("grupos")
      .select("*", { count: "exact", head: true })
      .eq("maestro_id", maestroId);

    if ((count || 0) >= 1) {
      return Response.json({ error: "Plan gratis: solo 1 grupo. Actualiza a premium." }, { status: 403 });
    }
  }

  const nombreGrupo = grado + " " + grupo;
  const { data: grupoData, error } = await supabaseAdmin
    .from("grupos")
    .insert({ maestro_id: maestroId, nombre: nombreGrupo, grado, grupo })
    .select()
    .single();

  if (error || !grupoData) {
    return Response.json({ error: "Error al crear el grupo" }, { status: 500 });
  }

  const listaAlumnos = alumnos
    .map((a: string) => a.trim().toUpperCase())
    .filter((a: string) => a.length > 0)
    .map((nombre: string) => ({ grupo_id: grupoData.id, nombre }));

  if (listaAlumnos.length > 0) {
    await supabaseAdmin.from("alumnos").insert(listaAlumnos);
  }

  return Response.json({ grupo: grupoData });
}