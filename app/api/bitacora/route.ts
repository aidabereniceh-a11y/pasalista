// Colocar en: app/api/bitacora/route.ts
export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { esPremium, respuestaNoPremium } from "@/lib/verificarPremium";

// Recibe "2026-09" y regresa { inicio: "2026-09-01", fin: "2026-10-01" }
function rangoMes(mes: string) {
  const [y, m] = mes.split("-").map(Number);
  const siguienteAnio = m === 12 ? y + 1 : y;
  const siguienteMes = m === 12 ? 1 : m + 1;
  return {
    inicio: `${mes}-01`,
    fin: `${siguienteAnio}-${String(siguienteMes).padStart(2, "0")}-01`,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { maestro_id: maestroId, grupo_id, alumno_nombre, fecha, situaciones, descripcion, accion, notifico_padres, firmas } = body;

  if (!maestroId) {
    return NextResponse.json({ error: "Falta maestro_id" }, { status: 401 });
  }
  if (!(await esPremium(maestroId))) {
    return NextResponse.json(respuestaNoPremium, { status: 403 });
  }
  if (!fecha) {
    return NextResponse.json({ error: "Falta la fecha" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("bitacora_incidencias")
    .insert({
      maestro_id: maestroId,
      grupo_id,
      alumno_nombre,
      fecha,
      situaciones,
      descripcion,
      accion,
      notifico_padres: !!notifico_padres,
      firmas,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, maestro_id: maestroId, grupo_id, alumno_nombre, fecha, situaciones, descripcion, accion, notifico_padres, firmas } = body;

  if (!id || !maestroId) {
    return NextResponse.json({ error: "Falta id o maestro_id" }, { status: 400 });
  }
  if (!(await esPremium(maestroId))) {
    return NextResponse.json(respuestaNoPremium, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("bitacora_incidencias")
    .update({
      grupo_id,
      alumno_nombre,
      fecha,
      situaciones,
      descripcion,
      accion,
      notifico_padres: !!notifico_padres,
      firmas,
    })
    .eq("id", id)
    .eq("maestro_id", maestroId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// GET /api/bitacora?maestro_id=1&mes=2026-09&grupo_id=5
// - Con "mes": trae TODAS las incidencias de ese mes (sin límite de 60)
// - Sin "mes": trae las 60 más recientes (como antes)
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const maestroId = params.get("maestro_id");
  const mes = params.get("mes");
  const grupoId = params.get("grupo_id");

  if (!maestroId) {
    return NextResponse.json({ error: "Falta maestro_id" }, { status: 401 });
  }
  if (!(await esPremium(maestroId))) {
    return NextResponse.json(respuestaNoPremium, { status: 403 });
  }

  let query = supabaseAdmin
    .from("bitacora_incidencias")
    .select("*")
    .eq("maestro_id", maestroId);

  if (grupoId) {
    query = query.eq("grupo_id", grupoId);
  }

  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const { inicio, fin } = rangoMes(mes);
    query = query.gte("fecha", inicio).lt("fecha", fin).order("fecha", { ascending: false }).limit(1000);
  } else {
    query = query.order("fecha", { ascending: false }).limit(60);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}