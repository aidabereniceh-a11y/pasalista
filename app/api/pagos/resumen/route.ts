// Colocar en: app/api/pagos/resumen/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

// GET /api/pagos/resumen?maestroId=40
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maestroId = searchParams.get("maestroId");

  if (!maestroId) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  // 1. Traer todos los grupos de academia del maestro
  const { data: grupos, error: errGrupos } = await supabaseAdmin
    .from("grupos")
    .select("id, asignatura, etiqueta")
    .eq("maestro_id", maestroId)
    .eq("tipo", "academia");

  if (errGrupos || !grupos) {
    return Response.json({ error: "Error al cargar grupos" }, { status: 500 });
  }

  if (grupos.length === 0) {
    return Response.json({ resumen: [] });
  }

  const grupoIds = grupos.map((g: any) => g.id);

  // 2. Traer alumnos activos de esos grupos
  const { data: alumnos, error: errAlumnos } = await supabaseAdmin
    .from("alumnos")
    .select("id, nombre, grupo_id")
    .in("grupo_id", grupoIds)
    .neq("activo", false);

  if (errAlumnos) {
    return Response.json({ error: "Error al cargar alumnos" }, { status: 500 });
  }

  const alumnoIds = (alumnos || []).map((a: any) => a.id);

  // 3. Traer todos los pagos de esos alumnos
  const { data: pagos, error: errPagos } = await supabaseAdmin
    .from("pagos")
    .select("id, alumno_id, grupo_id, concepto, monto, fecha_pago, fecha_vencimiento, estado, tipo")
    .in("alumno_id", alumnoIds)
    .order("fecha_pago", { ascending: false });

  if (errPagos) {
    return Response.json({ error: "Error al cargar pagos" }, { status: 500 });
  }

  // 4. Calcular mes actual
  const ahora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  // 5. Armar resumen por grupo
  const resumen = grupos.map((grupo: any) => {
    const alumnosGrupo = (alumnos || []).filter((a: any) => a.grupo_id === grupo.id);

    const alumnosConPago = alumnosGrupo.map((alumno: any) => {
      const pagosAlumno = (pagos || []).filter((p: any) => p.alumno_id === alumno.id);
      const ultimoPago = pagosAlumno[0] || null; // ya vienen ordenados por fecha desc

      return {
        id: alumno.id,
        nombre: alumno.nombre,
        ultimoPago: ultimoPago ? {
          concepto: ultimoPago.concepto,
          monto: ultimoPago.monto,
          fecha_pago: ultimoPago.fecha_pago,
          fecha_vencimiento: ultimoPago.fecha_vencimiento,
          estado: ultimoPago.estado,
          tipo: ultimoPago.tipo,
        } : null,
      };
    });

    // Total cobrado este mes en este grupo
    const totalMes = (pagos || [])
      .filter((p: any) => {
        if (p.grupo_id !== grupo.id) return false;
        if (!p.fecha_pago) return false;
        const fp = new Date(p.fecha_pago + "T12:00:00");
        return fp.getMonth() === mesActual && fp.getFullYear() === anioActual && p.estado === "pagado";
      })
      .reduce((sum: number, p: any) => sum + Number(p.monto), 0);

    return {
      grupo_id: grupo.id,
      nombre: grupo.asignatura || grupo.nombre,
      etiqueta: grupo.etiqueta || null,
      total_alumnos: alumnosGrupo.length,
      total_mes: totalMes,
      alumnos: alumnosConPago,
    };
  });

  return Response.json({ resumen, mes: `${ahora.toLocaleString("es-MX", { month: "long" })} ${anioActual}` });
}
