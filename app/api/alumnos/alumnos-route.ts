export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grupoId = searchParams.get("grupoId");

  if (!grupoId) {
    return Response.json({ error: "Falta grupoId" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("alumnos")
    .select("id, nombre")
    .eq("grupo_id", grupoId);

  if (error) {
    return Response.json({ error: "Error al cargar alumnos" }, { status: 500 });
  }

  return Response.json({ alumnos: data || [] });
}