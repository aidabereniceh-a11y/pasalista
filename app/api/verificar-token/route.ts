export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/verificar-token?t=TOKEN&grupoId=ID
// Verifica que el token pertenece a un maestro que tiene acceso al grupo
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("t");
  const grupoId = searchParams.get("grupoId");

  if (!token || !grupoId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  // Buscar al maestro por su session_token
  const { data: maestro, error } = await supabase
    .from("maestros")
    .select("id, nombre, email, plan, premium_hasta, preapproval_id, session_token")
    .eq("session_token", token)
    .single();

  if (error || !maestro) {
    return NextResponse.json({ error: "Token invalido o sesion expirada" }, { status: 401 });
  }

  // Verificar que el grupo pertenece a ese maestro
  const { data: grupo, error: errGrupo } = await supabase
    .from("grupos")
    .select("id")
    .eq("id", grupoId)
    .eq("maestro_id", maestro.id)
    .single();

  if (errGrupo || !grupo) {
    return NextResponse.json({ error: "No tienes acceso a este grupo" }, { status: 403 });
  }

  // Devolver datos del maestro (sin el session_token por seguridad)
  return NextResponse.json({
    maestro: {
      id: maestro.id,
      nombre: maestro.nombre,
      email: maestro.email,
      plan: maestro.plan,
      premium_hasta: maestro.premium_hasta,
      preapproval_id: maestro.preapproval_id,
    },
  });
}
