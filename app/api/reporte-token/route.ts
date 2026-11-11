import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = 'edge';

function generarToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  array.forEach(b => { token += chars[b % chars.length]; });
  return token;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const alumnoId = searchParams.get("alumnoId");
  const maestroId = searchParams.get("maestroId");

  if (!alumnoId || !maestroId) {
    return NextResponse.json({ error: "alumnoId y maestroId requeridos" }, { status: 400 });
  }

  // Verificar que el alumno pertenece a un grupo del maestro
  const { data: alumno } = await supabaseAdmin
    .from("alumnos")
    .select("id, nombre, reporte_token, grupo_id, grupos(maestro_id)")
    .eq("id", alumnoId)
    .single();

  if (!alumno) {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
  }

  const grupo = alumno.grupos as any;
  if (String(grupo?.maestro_id) !== String(maestroId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Si ya tiene token, devolverlo; si no, generarlo
  let token = alumno.reporte_token;
  if (!token) {
    token = generarToken();
    await supabaseAdmin
      .from("alumnos")
      .update({ reporte_token: token })
      .eq("id", alumnoId);
  }

  return NextResponse.json({
    token,
    url: `https://pasalista.mx/reporte/${token}`,
    alumno: alumno.nombre,
  });
}