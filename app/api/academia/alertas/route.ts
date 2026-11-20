// Colocar en: app/api/academia/alertas/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

// Día de la semana en español según fecha YYYY-MM-DD (hora México)
function diaSemanaDeHoy(): string {
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  // Fecha actual en zona horaria de México
  const ahora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  return dias[ahora.getDay()];
}

function fechaHoyMX(): string {
  const ahora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const y = ahora.getFullYear();
  const m = String(ahora.getMonth() + 1).padStart(2, "0");
  const d = String(ahora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// GET /api/academia/alertas?maestroId=123
// Devuelve alumnos que tienen clase hoy (según dias_clase) y faltaron o no tienen registro
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maestroId = searchParams.get("maestroId");

  if (!maestroId) {
    return Response.json({ error: "Falta maestroId" }, { status: 400 });
  }

  const hoy = fechaHoyMX();
  const diaHoy = diaSemanaDeHoy();

  // 1. Obtener todos los grupos de academia de este maestro
  const { data: grupos, error: errorGrupos } = await supabaseAdmin
    .from("grupos")
    .select("id, asignatura, nombre, etiqueta")
    .eq("maestro_id", maestroId)
    .eq("tipo", "academia");

  if (errorGrupos || !grupos || grupos.length === 0) {
    return Response.json({ alertas: [] });
  }

  const grupoIds = grupos.map((g: any) => g.id);

  // 2. Obtener todos los alumnos activos de esos grupos que tienen clase hoy
  const { data: alumnos, error: errorAlumnos } = await supabaseAdmin
    .from("alumnos")
    .select("id, nombre, grupo_id, tutor_nombre, tutor_whatsapp, dias_clase")
    .in("grupo_id", grupoIds)
    .neq("activo", false);

  if (errorAlumnos || !alumnos) {
    return Response.json({ alertas: [] });
  }

  // Filtrar solo los alumnos que tienen clase hoy
  const alumnosDeHoy = alumnos.filter((a: any) => {
    if (!a.dias_clase || a.dias_clase.length === 0) return false;
    return a.dias_clase.includes(diaHoy);
  });

  if (alumnosDeHoy.length === 0) {
    return Response.json({ alertas: [] });
  }

  const alumnoIdsDeHoy = alumnosDeHoy.map((a: any) => a.id);

  // 3. Obtener registros de asistencia de hoy para esos alumnos
  const inicioDia = `${hoy}T00:00:00.000Z`;
  const finDia = `${hoy}T23:59:59.999Z`;

  const { data: asistencias } = await supabaseAdmin
    .from("asistencia")
    .select("alumno_id, accion")
    .in("alumno_id", alumnoIdsDeHoy)
    .gte("fecha", inicioDia)
    .lte("fecha", finDia)
    .in("accion", ["Presente", "Ausente", "Retardo", "Justificado"]);

  // Mapa: alumno_id -> accion de hoy
  const mapaAsistencia: Record<number, string> = {};
  for (const reg of asistencias || []) {
    mapaAsistencia[reg.alumno_id] = reg.accion;
  }

  // Mapa: grupo_id -> nombre de actividad
  const mapaGrupo: Record<number, string> = {};
  for (const g of grupos) {
    mapaGrupo[g.id] = g.asignatura || g.nombre;
  }

  // 4. Generar alertas: alumnos sin registro o con "Ausente"
  const alertas = alumnosDeHoy
    .filter((a: any) => {
      const accion = mapaAsistencia[a.id];
      return !accion || accion === "Ausente"; // Sin registro o ausente
    })
    .map((a: any) => ({
      alumno_id: a.id,
      nombre: a.nombre,
      actividad: mapaGrupo[a.grupo_id] || "Actividad",
      tutor_nombre: a.tutor_nombre || null,
      tutor_whatsapp: a.tutor_whatsapp || null,
      accion: mapaAsistencia[a.id] || "Sin registro",
    }));

  return Response.json({ alertas, dia: diaHoy, fecha: hoy });
}
