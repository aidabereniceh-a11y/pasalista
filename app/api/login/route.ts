export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import bcrypt from "bcryptjs";

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

  const passwordCorrecto = await bcrypt.compare(password, data.password);

  if (!passwordCorrecto) {
    return Response.json({ error: "Email o contrasena incorrectos" }, { status: 401 });
  }

  // No regresamos el password (hasheado) al cliente
  const { password: _omitido, ...maestroSinPassword } = data;

  return Response.json({ maestro: maestroSinPassword });
}