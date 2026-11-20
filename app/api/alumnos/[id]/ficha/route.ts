import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export const runtime = "edge";

// PUT /api/alumnos/[id]/ficha — actualizar datos de contacto del alumno
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alumnoId = parseInt(params.id, 10);
    if (isNaN(alumnoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { maestroId, tutor_nombre, tutor_whatsapp, fecha_inscripcion, notas } = body;

    if (!maestroId) {
      return NextResponse.json({ error: "maestroId requerido" }, { status: 400 });
    }

    // Verificar que el alumno pertenece a un grupo del maestro
    const { data: alumno, error: fetchError } = await supabaseAdmin
      .from("alumnos")
      .select("id, grupo_id, grupos!inner(maestro_id)")
      .eq("id", alumnoId)
      .single();

    if (fetchError || !alumno) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    const grupo = alumno.grupos as any;
    if (String(grupo.maestro_id) !== String(maestroId)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    // Limpiar el número de WhatsApp: solo dígitos, máx 10
    const whatsappLimpio = tutor_whatsapp
      ? String(tutor_whatsapp).replace(/\D/g, "").slice(0, 10)
      : null;

    const { error: updateError } = await supabaseAdmin
      .from("alumnos")
      .update({
        tutor_nombre: tutor_nombre || null,
        tutor_whatsapp: whatsappLimpio || null,
        fecha_inscripcion: fecha_inscripcion || null,
        notas: notas || null,
      })
      .eq("id", alumnoId);

    if (updateError) {
      console.error("Error actualizando ficha:", updateError);
      return NextResponse.json({ error: "No se pudo guardar la ficha" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en PUT /api/alumnos/[id]/ficha:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// GET /api/alumnos/[id]/ficha — obtener datos de contacto del alumno
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alumnoId = parseInt(params.id, 10);
    if (isNaN(alumnoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const maestroId = searchParams.get("maestroId");

    if (!maestroId) {
      return NextResponse.json({ error: "maestroId requerido" }, { status: 400 });
    }

    const { data: alumno, error } = await supabaseAdmin
      .from("alumnos")
      .select("id, nombre, tutor_nombre, tutor_whatsapp, fecha_inscripcion, notas, grupos!inner(maestro_id)")
      .eq("id", alumnoId)
      .single();

    if (error || !alumno) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    const grupo = alumno.grupos as any;
    if (String(grupo.maestro_id) !== String(maestroId)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    return NextResponse.json({
      alumno: {
        id: alumno.id,
        nombre: alumno.nombre,
        tutor_nombre: alumno.tutor_nombre,
        tutor_whatsapp: alumno.tutor_whatsapp,
        fecha_inscripcion: alumno.fecha_inscripcion,
        notas: alumno.notas,
      },
    });
  } catch (err) {
    console.error("Error en GET /api/alumnos/[id]/ficha:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
