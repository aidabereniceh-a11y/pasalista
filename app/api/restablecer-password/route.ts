// Colocar en: app/api/restablecer-password/route.ts
export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { hashPassword } from "../../../lib/passwordHash";

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "La contrasena debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const { data: reset } = await supabaseAdmin
    .from("password_resets")
    .select("*")
    .eq("token", token)
    .eq("used", false)
    .single();

  if (!reset || new Date(reset.expires_at) < new Date()) {
    return Response.json({ error: "El enlace ya expiro o no es valido. Solicita uno nuevo." }, { status: 400 });
  }

  const passwordHasheado = await hashPassword(password);

  const { error: errorUpdate } = await supabaseAdmin
    .from("maestros")
    .update({ password: passwordHasheado })
    .eq("id", reset.maestro_id);

  if (errorUpdate) {
    return Response.json({ error: "No se pudo actualizar la contrasena" }, { status: 500 });
  }

  await supabaseAdmin.from("password_resets").update({ used: true }).eq("id", reset.id);

  return Response.json({ ok: true });
}