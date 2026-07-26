export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  const body = await request.json();

  // Solo procesamos notificaciones de pago
  if (body.type !== "payment") {
    return Response.json({ ok: true });
  }

  // Verificar el pago con MercadoPago
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

  // De lo contrario, es solo el maestroId -> pago de Premium
  const premiumHasta = new Date();
  premiumHasta.setDate(premiumHasta.getDate() + 30);

  await supabaseAdmin
    .from("maestros")
    .update({ plan: "premium", premium_hasta: premiumHasta.toISOString() })
    .eq("id", referencia);

  return Response.json({ ok: true });
}