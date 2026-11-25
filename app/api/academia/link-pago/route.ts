export const runtime = "edge";

import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { maestroId, alumnoId, grupoId, concepto, monto, alumnoNombre, tutorWhatsapp } = body;

  if (!maestroId || !alumnoId || !concepto || !monto) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // 1. Obtener el token de MP del maestro
  const { data: maestro, error: errMaestro } = await supabase
    .from("maestros")
    .select("mp_access_token, nombre")
    .eq("id", maestroId)
    .single();

  if (errMaestro || !maestro?.mp_access_token) {
    return NextResponse.json(
      { error: "No tienes MercadoPago conectado. Ve a Mi perfil para configurarlo." },
      { status: 400 }
    );
  }

  // 2. Verificar que el grupo pertenece al maestro
  const { data: grupo, error: errGrupo } = await supabase
    .from("grupos")
    .select("id, nombre, asignatura")
    .eq("id", grupoId)
    .eq("maestro_id", maestroId)
    .single();

  if (errGrupo || !grupo) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // 3. Crear preferencia de pago en MP con el token del maestro
  const preference = {
    items: [
      {
        title: `${concepto} — ${grupo.asignatura || grupo.nombre}`,
        description: `Alumno: ${alumnoNombre}`,
        quantity: 1,
        unit_price: parseFloat(monto),
        currency_id: "MXN",
      },
    ],
    metadata: {
      maestro_id: maestroId,
      alumno_id: alumnoId,
      grupo_id: grupoId,
      concepto,
    },
    statement_descriptor: "PasaLista Academia",
  };

  const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${maestro.mp_access_token}`,
    },
    body: JSON.stringify(preference),
  });

  if (!mpRes.ok) {
    const err = await mpRes.json().catch(() => ({}));
    console.error("MP error:", err);
    return NextResponse.json(
      { error: "Error al generar el link de pago. Verifica que tu token de MercadoPago sea válido." },
      { status: 500 }
    );
  }

  const mpData = await mpRes.json();
  const linkPago = mpData.init_point; // URL de pago de producción

  // 4. Armar link de WhatsApp si tiene teléfono
  let whatsappUrl: string | null = null;
  if (tutorWhatsapp && tutorWhatsapp.length === 10) {
    const mensaje = encodeURIComponent(
      `Hola${alumnoNombre ? ` 👋, te escribimos sobre ${alumnoNombre}` : ""}.\n\n` +
      `💳 *${concepto}* — $${parseFloat(monto).toFixed(2)} MXN\n\n` +
      `Puedes pagar aquí:\n${linkPago}\n\n` +
      `_Enviado desde PasaLista_`
    );
    whatsappUrl = `https://wa.me/52${tutorWhatsapp}?text=${mensaje}`;
  }

  return NextResponse.json({ link: linkPago, whatsapp: whatsappUrl });
}
