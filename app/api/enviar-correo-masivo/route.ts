// Colocar en: app/api/enviar-correo-masivo/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  const { secret, asunto, mensaje, remitente } = await request.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!asunto || !mensaje) {
    return Response.json({ error: "Falta el asunto o el mensaje" }, { status: 400 });
  }

  const { data: maestros, error } = await supabaseAdmin
    .from("maestros")
    .select("nombre, email");

  if (error || !maestros) {
    return Response.json({ error: "No se pudo leer la tabla de maestros" }, { status: 500 });
  }

  const from = remitente || "PasaLista <avisos@pasalista.mx>";
  let enviados = 0;
  let fallidos: string[] = [];

  for (const m of maestros) {
    if (!m.email) continue;

    const primerNombre = (m.nombre || "").trim().split(" ")[0] || "Maestro(a)";
    const htmlPersonalizado = mensaje
      .replaceAll("{{nombre}}", m.nombre || "")
      .replaceAll("{{primer_nombre}}", primerNombre);

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: m.email,
          subject: asunto,
          html: htmlPersonalizado,
        }),
      });
      if (res.ok) {
        enviados++;
      } else {
        fallidos.push(m.email);
      }
    } catch {
      fallidos.push(m.email);
    }

    // Pequena pausa para no saturar el limite de envios por segundo
    await new Promise((r) => setTimeout(r, 150));
  }

  return Response.json({ ok: true, total: maestros.length, enviados, fallidos });
}