// Colocar en: app/api/gafetes/pago/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

const PRECIO_GAFETES = 99;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { grupoId, grupoNombre, maestroId } = body;
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      return Response.json({ error: "Token no configurado" }, { status: 500 });
    }

    if (!grupoId || !grupoNombre || !maestroId) {
      return Response.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Revisamos el grupo antes de cobrar
    const { data: grupo, error: errorGrupo } = await supabaseAdmin
      .from("grupos")
      .select("*")
      .eq("id", grupoId)
      .single();

    if (errorGrupo || !grupo) {
      return Response.json({ error: "No se encontró el grupo" }, { status: 404 });
    }
    if (grupo.maestro_id !== undefined && String(grupo.maestro_id) !== String(maestroId)) {
      return Response.json({ error: "Este grupo no pertenece a tu cuenta" }, { status: 403 });
    }
    if (grupo.gafetes_pagado) {
      // Ya estaba pagado: no cobramos otra vez
      return Response.json({ url: "https://pasalista.mx/dashboard?gafetes=ok&grupo=" + grupoId });
    }

    const preference = {
      items: [{
        id: String(grupoId),
        title: "Gafetes QR " + grupoNombre,
        quantity: 1,
        unit_price: PRECIO_GAFETES,
        currency_id: "MXN",
      }],
      back_urls: {
        success: "https://pasalista.mx/dashboard?gafetes=ok&grupo=" + grupoId,
        failure: "https://pasalista.mx/dashboard?gafetes=error&grupo=" + grupoId,
        pending: "https://pasalista.mx/dashboard?gafetes=pendiente&grupo=" + grupoId,
      },
      auto_return: "approved",
      external_reference: "gafetes_" + grupoId + "_" + maestroId,
      notification_url: "https://pasalista.mx/api/gafetes/webhook",
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify(preference),
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json({ error: "Mercado Pago no respondió correctamente" }, { status: 500 });
    }

    if (!data.init_point) {
      console.error("Gafetes pago: sin init_point", data);
      return Response.json({ error: "No se pudo crear el pago. Intenta de nuevo." }, { status: 500 });
    }

    return Response.json({ url: data.init_point });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}