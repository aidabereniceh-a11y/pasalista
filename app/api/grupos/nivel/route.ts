// Colocar en: app/api/grupos/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const NIVELES_VALIDOS = ["preescolar", "primaria", "secundaria", "media_superior", "superior"];
const NIVELES_CON_ASIGNATURA = ["secundaria", "media_superior", "superior"];

// Para comparar textos sin importar mayúsculas, acentos ni espacios de más
function normalizar(texto: unknown): string {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// GET /api/grupos?maestroId=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maestroId = searchParams.get("maestroId");

  if (!maestroId) {
    return Response.json({ error: "Falta maestroId" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("grupos")
    .select("*")
    .eq("maestro_id", maestroId)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Error al cargar grupos" }, { status: 500 });
  }

  return Response.json({ grupos: data || [] });
}

// POST /api/grupos
// Body: { maestroId, nombre?, grado, grupo, alumnos, nivelEducativo, asignatura, etiqueta, confirmarDuplicado? }
export async function POST(request: Request) {
  const { maestroId, nombre, grado, grupo, alumnos, nivelEducativo, asignatura, etiqueta, confirmarDuplicado } = await request.json();

  if (!maestroId || !grado || !grupo) {
    return Response.json({ error: "Faltan campos" }, { status: 400 });
  }

  if (nivelEducativo && !NIVELES_VALIDOS.includes(nivelEducativo)) {
    return Response.json({ error: "Nivel educativo inválido" }, { status: 400 });
  }

  // Si el frontend no manda un nombre, lo generamos con grado + grupo (ej. "1A")
  const nombreGrupo = nombre || `${grado}${grupo}`;

  // La asignatura es opcional y solo aplica a secundaria, media superior y superior
  const asignaturaLimpia =
    nivelEducativo &&
    NIVELES_CON_ASIGNATURA.includes(nivelEducativo) &&
    typeof asignatura === "string" &&
    asignatura.trim()
      ? asignatura.trim().slice(0, 80)
      : null;

  // Escuela o turno (opcional), para distinguir grupos que se llaman igual
  const etiquetaLimpia =
    typeof etiqueta === "string" && etiqueta.trim() ? etiqueta.trim().replace(/\s+/g, " ").slice(0, 60) : null;

  // Verifica el plan del maestro y el limite de grupos si es gratis
  const { data: maestroData } = await supabaseAdmin
    .from("maestros")
    .select("plan")
    .eq("id", maestroId)
    .single();

  if (maestroData?.plan === "gratis") {
    const { count } = await supabaseAdmin
      .from("grupos")
      .select("*", { count: "exact", head: true })
      .eq("maestro_id", maestroId);

    if ((count || 0) >= 1) {
      return Response.json(
        { error: "Plan gratis: solo 1 grupo. Actualiza a premium." },
        { status: 403 }
      );
    }
  }

  // ¿Ya existe un grupo igual (mismo nombre, asignatura y escuela/turno)?
  if (!confirmarDuplicado) {
    const { data: existentes } = await supabaseAdmin
      .from("grupos")
      .select("id, nombre, asignatura, etiqueta")
      .eq("maestro_id", maestroId);

    const repetido = (existentes || []).find(
      (g: any) =>
        normalizar(g.nombre) === normalizar(nombreGrupo) &&
        normalizar(g.asignatura) === normalizar(asignaturaLimpia) &&
        normalizar(g.etiqueta) === normalizar(etiquetaLimpia)
    );

    if (repetido) {
      return Response.json(
        {
          duplicado: true,
          grupoExistente: repetido,
          error: `Ya tienes un grupo llamado ${repetido.nombre}${repetido.asignatura ? " · " + repetido.asignatura : ""}${repetido.etiqueta ? " · " + repetido.etiqueta : ""}.`,
        },
        { status: 409 }
      );
    }
  }

  const { data: grupoData, error } = await supabaseAdmin
    .from("grupos")
    .insert({
      maestro_id: maestroId,
      nombre: nombreGrupo,
      grado,
      grupo,
      nivel_educativo: nivelEducativo || null,
      asignatura: asignaturaLimpia,
      etiqueta: etiquetaLimpia,
    })
    .select()
    .single();

  if (error || !grupoData) {
    return Response.json({ error: "Error al crear el grupo" }, { status: 500 });
  }

  const listaAlumnos = (alumnos || [])
    .map((a: string) => a.trim().toUpperCase())
    .filter((a: string) => a.length > 0)
    .map((nombreAlumno: string) => ({ grupo_id: grupoData.id, nombre: nombreAlumno }));

  if (listaAlumnos.length > 0) {
    await supabaseAdmin.from("alumnos").insert(listaAlumnos);
  }

  return Response.json({ grupo: grupoData });
}