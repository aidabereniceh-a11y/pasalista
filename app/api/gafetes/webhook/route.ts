export const runtime = "edge";

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
        Authorization: "Bearer APP_USR-3590582654218222-060517-286eaebdef27d1b7ebfe00b397e051d9-3453986570",
      },
    }
  );
  const pago = await pagoRes.json();

  if (pago.status !== "approved") {
    return Response.json({ ok: true });
  }

  // Extraer grupoId de la referencia: "gafetes_{grupoId}_{maestroId}"
  const partes = pago.external_reference?.split("_");
  if (!partes || partes[0] !== "gafetes") {
    return Response.json({ ok: true });
  }

  const grupoId = partes[1];

  // Marcar el grupo como pagado en Supabase
  await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/grupos?id=eq.${grupoId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        gafetes_pagado: true,
        gafetes_pagado_at: new Date().toISOString(),
      }),
    }
  );

  return Response.json({ ok: true });
}