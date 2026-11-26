export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { verifyPassword } from "../../../lib/passwordHash";

function generarToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Faltan campos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("maestros")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    return Response.json({ error: "Email o contrasena incorrectos" }, { status: 401 });
  }

  const passwordCorrecto = await verifyPassword(password, data.password);

  if (!passwordCorrecto) {
    return Response.json({ error: "Email o contrasena incorrectos" }, { status: 401 });
  }

  // Generar session_token y guardarlo en BD
  const session_token = generarToken();
  await supabaseAdmin
    .from("maestros")
    .update({ session_token })
    .eq("id", data.id);

  const { password: _omitido, ...maestroSinPassword } = data;

  return Response.json({ maestro: { ...maestroSinPassword, session_token } });
}
