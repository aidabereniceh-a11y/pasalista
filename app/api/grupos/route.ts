// Colocar en: app/api/grupos/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const NIVELES_VALIDOS = ["preescolar", "primaria", "secundaria", "media_superior", "superior", "academia"];
const NIVELES_CON_ASIGNATURA = ["secundaria", "media_superior", "superior", "academia"];

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
// GET /api/grupos?maestroId=123&tipo=academia   ← filtra solo actividades de academia
// GET /api/grupos?maestroId=123&tipo=escuela    ← filtra solo grupos de escuela
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maestroId = searchParams.get("maestroId");
  const tipo = searchParams.get("tipo"); // "academia" | "escuela" | null

  if (!maestroId) {
    return Response.json({ error: "Falta maestroId" }, { status: 400 });
  }

  let query = supabaseAdmin
    .from("grupos")
    .select("*")
    .eq("maestro_id", maestroId)
    .order("created_at", { ascending: false });

  if (tipo === "academia") {
    query = query.eq("tipo", "academia");
  } else if (tipo === "escuela") {
    query = query.or("tipo.eq.escuela,tipo.is.null");
  }
  // Si no se manda tipo, devuelve todos (comportamiento anterior)

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: "Error al cargar grupos" }, { status: 500 });
  }

  return Response.json({ grupos: data || [] });
}

// POST /api/grupos
// Body: { maestroId, nombre?, grado, grupo, alumnos, nivelEducativo, asignatura, etiqueta, confirmarDuplicado?, tipo? }
export async function POST(request: Request) {
  const { maestroId, nombre, grado, grupo, alumnos, nivelEducativo, asignatura, etiqueta, confirmarDuplicado, tipo } = await request.json();

  if (!maestroId || !grado || !grupo) {
    return Response.json({ error: "Faltan campos" }, { status: 400 });
  }

  if (nivelEducativo && !NIVELES_VALIDOS.includes(nivelEducativo)) {
    return Response.json({ error: "Nivel educativo inválido" }, { status: 400 });
  }

  // "academia" o "escuela" (default: "escuela")
  const tipoGrupo = tipo === "academia" ? "academia" : "escuela";

  // Si el frontend no manda un nombre, lo generamos con grado + grupo (ej. "1A")
  const nombreGrupo = nombre || `${grado}${grupo}`;

  // La asignatura es opcional: aplica a secundaria, media superior, superior y academia
  const asignaturaLimpia =
    nivelEducativo &&
    NIVELES_CON_ASIGNATURA.includes(nivelEducativo) &&
    typeof asignatura === "string" &&
    asignatura.trim()
      ? asignatura.trim().slice(0, 80)
      : typeof asignatura === "string" && asignatura.trim()
        ? asignatura.trim().slice(0, 80)
        : null;

  // Horario o turno (opcional)
  const etiquetaLimpia =
    typeof etiqueta === "string" && etiqueta.trim() ? etiqueta.trim().replace(/\s+/g, " ").slice(0, 60) : null;

  // Verifica el plan del maestro y el límite de grupos si es gratis
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

  // ¿Ya existe un grupo igual (mismo nombre, asignatura y etiqueta)?
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
      tipo: tipoGrupo,
    })
    .select()
    .single();

  if (error || !grupoData) {
    return Response.json({ error: "Error al crear el grupo", detalle: error?.message, codigo: error?.code }, { status: 500 });
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
