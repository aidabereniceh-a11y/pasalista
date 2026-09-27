// Colocar en: app/api/gafetes/webhook/route.ts
// Webhook unificado de Mercado Pago: gafetes, Premium manual y suscripciones
export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

const PRECIO_GAFETES = 99;

async function activarPremium(maestroId: string, preapprovalId?: string) {
  const premiumHasta = new Date();
  premiumHasta.setDate(premiumHasta.getDate() + 30);

  const updateData: Record<string, unknown> = {
    plan: "premium",
    premium_hasta: premiumHasta.toISOString(),
  };
  if (preapprovalId) {
    updateData.preapproval_id = preapprovalId;
  }

  const { error } = await supabaseAdmin.from("maestros").update(updateData).eq("id", maestroId);
  if (error) throw new Error("No se pudo activar Premium: " + error.message);
}

async function marcarGafetesPagados(grupoId: string) {
  // Intento 1: con la fecha de pago
  const { error } = await supabaseAdmin
    .from("grupos")
    .update({ gafetes_pagado: true, gafetes_pagado_at: new Date().toISOString() })
    .eq("id", grupoId);

  if (!error) return;

  // Intento 2: si la columna gafetes_pagado_at no existe, al menos marcamos como pagado
  console.error("Webhook gafetes, intento 1 falló:", error.message);
  const { error: error2 } = await supabaseAdmin
    .from("grupos")
    .update({ gafetes_pagado: true })
    .eq("id", grupoId);

  if (error2) throw new Error("No se pudo marcar gafetes como pagados: " + error2.message);
}

// Mercado Pago avisa en dos formatos distintos:
// - Webhook:  body = { type: "payment", data: { id: "123" } }
// - IPN:      URL  = ?topic=payment&id=123   (o ?type=payment&data.id=123)
function leerNotificacion(url: URL, body: any) {
  const tipo =
    body?.type ||
    body?.topic ||
    url.searchParams.get("type") ||
    url.searchParams.get("topic") ||
    "";
  const id =
    body?.data?.id ||
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    (typeof body?.resource === "string" ? body.resource.split("/").pop() : "") ||
    "";
  return { tipo: String(tipo), id: String(id) };
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // Algunas notificaciones IPN llegan sin cuerpo; usamos los parámetros de la URL
  }

  const { tipo, id } = leerNotificacion(url, body);
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    console.error("Webhook: falta MERCADOPAGO_ACCESS_TOKEN");
    return Response.json({ error: "Token no configurado" }, { status: 500 });
  }

  try {
    // --- Suscripción automática (preapproval) ---
    if (tipo === "subscription_preapproval" || tipo === "preapproval") {
      if (!id) return Response.json({ ok: true });

      const preRes = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!preRes.ok) {
        // 500 hace que Mercado Pago vuelva a intentar más tarde
        return Response.json({ error: "No se pudo consultar la suscripción" }, { status: 500 });
      }
      const preapproval = await preRes.json();

      const maestroId = preapproval.external_reference as string | undefined;
      if (!maestroId) return Response.json({ ok: true });

      if (preapproval.status === "authorized") {
        await activarPremium(maestroId, id);
      }

      if (preapproval.status === "cancelled" || preapproval.status === "paused") {
        // No bajamos a "gratis" de inmediato: dejamos que expire premium_hasta.
        await supabaseAdmin.from("maestros").update({ preapproval_id: null }).eq("id", maestroId);
      }

      return Response.json({ ok: true });
    }

    // --- Pagos (gafetes, Premium manual y cobros recurrentes) ---
    if (tipo !== "payment" || !id) {
      return Response.json({ ok: true });
    }

    // Nunca le creemos al aviso: consultamos el pago directamente a Mercado Pago
    const pagoRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!pagoRes.ok) {
      return Response.json({ error: "No se pudo consultar el pago" }, { status: 500 });
    }
    const pago = await pagoRes.json();

    if (pago.status !== "approved") {
      // pending (OXXO/SPEI), rejected, etc. Mercado Pago avisará otra vez cuando cambie.
      return Response.json({ ok: true });
    }

    const referencia = pago.external_reference as string | undefined;
    if (!referencia) return Response.json({ ok: true });

    // Formato "gafetes_{grupoId}_{maestroId}" -> pago de gafetes
    if (referencia.startsWith("gafetes_")) {
      const partes = referencia.split("_");
      const grupoId = partes[1];
      if (!grupoId) return Response.json({ ok: true });

      const monto = Number(pago.transaction_amount);
      if (!(monto >= PRECIO_GAFETES) || pago.currency_id !== "MXN") {
        console.error(`Webhook gafetes: monto inesperado ${monto} ${pago.currency_id} (pago ${id})`);
        return Response.json({ ok: true });
      }

      await marcarGafetesPagados(grupoId);
      return Response.json({ ok: true });
    }

    // De lo contrario, la referencia es el maestroId -> pago de Premium
    await activarPremium(referencia);
    return Response.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook error:", err?.message);
    // 500 = Mercado Pago reintenta el aviso, así no se pierde el pago
    return Response.json({ error: err?.message || "Error" }, { status: 500 });
  }
}

// Algunas herramientas de Mercado Pago prueban la URL con GET
export async function GET() {
  return Response.json({ ok: true });
}