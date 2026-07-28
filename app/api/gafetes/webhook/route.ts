export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

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

  await supabaseAdmin.from("maestros").update(updateData).eq("id", maestroId);
}

export async function POST(request: Request) {
  const body = await request.json();

  // --- Notificaciones de suscripcion automatica (preapproval) ---
  if (body.type === "subscription_preapproval") {
    const preapprovalId = body.data?.id;
    if (!preapprovalId) {
      return Response.json({ ok: true });
    }

    const preRes = await fetch(
      `https://api.mercadopago.com/preapproval/${preapprovalId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );
    const preapproval = await preRes.json();

    const maestroId = preapproval.external_reference as string | undefined;
    if (!maestroId) {
      return Response.json({ ok: true });
    }

    if (preapproval.status === "authorized") {
      await activarPremium(maestroId, preapprovalId);
    }

    if (preapproval.status === "cancelled" || preapproval.status === "paused") {
      // No bajamos a "gratis" de inmediato: dejamos que expire premium_hasta
      // de forma natural, como ya hace el dashboard. Solo limpiamos el id.
      await supabaseAdmin
        .from("maestros")
        .update({ preapproval_id: null })
        .eq("id", maestroId);
    }

    return Response.json({ ok: true });
  }

  // --- Notificaciones de pago (gafetes, premium manual, y cobros recurrentes) ---
  if (body.type !== "payment") {
    return Response.json({ ok: true });
  }

  const pagoRes = await fetch(
    `https://api.mercadopago.com/v1/payments/${body.data.id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  );
  const pago = await pagoRes.json();

  if (pago.status !== "approved") {
    return Response.json({ ok: true });
  }

  const referencia = pago.external_reference as string | undefined;
  if (!referencia) {
    return Response.json({ ok: true });
  }

  // Formato "gafetes_{grupoId}_{maestroId}" -> pago de gafetes
  if (referencia.startsWith("gafetes_")) {
    const partes = referencia.split("_");
    const grupoId = partes[1];

    await supabaseAdmin
      .from("grupos")
      .update({ gafetes_pagado: true, gafetes_pagado_at: new Date().toISOString() })
      .eq("id", grupoId);

    return Response.json({ ok: true });
  }

  // De lo contrario, es solo el maestroId -> pago de Premium (manual o cobro recurrente)
  await activarPremium(referencia);

  return Response.json({ ok: true });
}