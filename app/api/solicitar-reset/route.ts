// Colocar en: app/api/solicitar-reset/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "Falta el correo" }, { status: 400 });
  }

  const { data: maestro } = await supabaseAdmin
    .from("maestros")
    .select("id, nombre")
    .eq("email", email)
    .single();

  // Si el correo no existe, respondemos igual "ok" para no revelar
  // qué correos estan registrados (buena practica de seguridad).
  if (!maestro) {
    return Response.json({ ok: true });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hora

  const { error } = await supabaseAdmin.from("password_resets").insert({
    maestro_id: maestro.id,
    token,
    expires_at: expiresAt,
  });

  if (error) {
    return Response.json({ error: "No se pudo generar el enlace" }, { status: 500 });
  }

  const link = `https://pasalista.mx/restablecer?token=${token}`;
  const primerNombre = (maestro.nombre || "").trim().split(" ")[0] || "Maestro(a)";

  const html = `
    <div style="font-family: Arial, sans-serif; color:#1e293b; max-width:480px; margin:0 auto;">
      <h2 style="color:#4f46e5;">Hola ${primerNombre},</h2>
      <p style="font-size:15px; line-height:1.6;">
        Recibimos una solicitud para restablecer tu contraseña de PasaLista. Si fuiste tú, dale clic al siguiente botón:
      </p>
      <div style="text-align:center; margin:28px 0;">
        <a href="${link}" style="background:linear-gradient(135deg,#667eea,#764ba2); color:white; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:bold;">
          Restablecer mi contraseña
        </a>
      </div>
      <p style="font-size:13px; color:#64748b;">
        Este enlace expira en 1 hora. Si tú no solicitaste este cambio, puedes ignorar este correo.
      </p>
    </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PasaLista <avisos@pasalista.mx>",
        to: email,
        subject: "Restablece tu contraseña de PasaLista",
        html,
      }),
    });
  } catch {
    return Response.json({ error: "No se pudo enviar el correo" }, { status: 500 });
  }

  return Response.json({ ok: true });
}