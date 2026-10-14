// Colocar en: app/api/grupos/nivel/route.ts
export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

const NIVELES_VALIDOS = ["preescolar", "primaria", "secundaria", "media_superior", "superior"];
const NIVELES_CON_ASIGNATURA = ["secundaria", "media_superior", "superior"];

// PUT { grupo_id, maestro_id, nivel_educativo, grado, asignatura? }
// Guarda el nivel educativo, grado y (solo secundaria / media superior / superior) el nombre
// de la asignatura del grupo.
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { grupo_id, maestro_id, nivel_educativo, grado, asignatura } = body;

  if (!grupo_id || !maestro_id || !nivel_educativo || !grado) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }
  if (!NIVELES_VALIDOS.includes(nivel_educativo)) {
    return NextResponse.json({ error: "Nivel educativo inválido" }, { status: 400 });
  }

  const { data: grupo, error: errorGrupo } = await supabaseAdmin
    .from("grupos")
    .select("id, maestro_id")
    .eq("id", grupo_id)
    .single();

  if (errorGrupo || !grupo || String(grupo.maestro_id) !== String(maestro_id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const asignaturaLimpia =
    NIVELES_CON_ASIGNATURA.includes(nivel_educativo) && typeof asignatura === "string" && asignatura.trim()
      ? asignatura.trim().slice(0, 80)
      : null;

  const { data, error } = await supabaseAdmin
    .from("grupos")
    .update({ nivel_educativo, grado, asignatura: asignaturaLimpia })
    .eq("id", grupo_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
