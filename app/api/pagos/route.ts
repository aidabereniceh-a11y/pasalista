// Colocar en: app/api/pagos/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Verifica que el grupo pertenece al maestro
async function verificarMaestro(grupoId: number, maestroId: string) {
  const { data: grupo } = await supabaseAdmin
    .from("grupos")
    .select("maestro_id")
    .eq("id", grupoId)
    .single();
  return grupo && String(grupo.maestro_id) === String(maestroId);
}

// GET /api/pagos?alumnoId=123&grupoId=456&maestroId=40
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const alumnoId = searchParams.get("alumnoId");
  const grupoId = searchParams.get("grupoId");
  const maestroId = searchParams.get("maestroId");

  if (!alumnoId || !grupoId || !maestroId) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  const autorizado = await verificarMaestro(Number(grupoId), maestroId);
  if (!autorizado) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("pagos")
    .select("*")
    .eq("alumno_id", alumnoId)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Error al cargar pagos" }, { status: 500 });
  }

  return Response.json({ pagos: data || [] });
}

// POST /api/pagos
// body: { alumnoId, grupoId, maestroId, concepto, monto, fecha_pago, fecha_vencimiento?, estado, notas? }
export async function POST(request: Request) {
  const body = await request.json();
  const { alumnoId, grupoId, maestroId, concepto, monto, fecha_pago, fecha_vencimiento, estado } = body;

  if (!alumnoId || !grupoId || !maestroId || !concepto || !monto || !fecha_pago || !estado) {
    return Response.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const montoNum = parseFloat(monto);
  if (isNaN(montoNum) || montoNum <= 0) {
    return Response.json({ error: "Monto inválido" }, { status: 400 });
  }

  const autorizado = await verificarMaestro(Number(grupoId), maestroId);
  if (!autorizado) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("pagos")
    .insert({
      alumno_id: Number(alumnoId),
      grupo_id: Number(grupoId),
      concepto: concepto.trim(),
      monto: montoNum,
      fecha_pago,
      fecha_vencimiento: fecha_vencimiento || null,
      estado,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: "Error al registrar pago", detalle: error.message }, { status: 500 });
  }

  return Response.json({ pago: data });
}

// DELETE /api/pagos?id=123&grupoId=456&maestroId=40
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const grupoId = searchParams.get("grupoId");
  const maestroId = searchParams.get("maestroId");

  if (!id || !grupoId || !maestroId) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  const autorizado = await verificarMaestro(Number(grupoId), maestroId);
  if (!autorizado) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("pagos")
    .delete()
    .eq("id", id);

  if (error) {
    return Response.json({ error: "Error al eliminar" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
