export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { nombre, email, password } = await request.json();

  if (!nombre || !email || !password) {
    return Response.json({ error: "Faltan campos" }, { status: 400 });
  }

  const { data: existente } = await supabaseAdmin
    .from("maestros")
    .select("id")
    .eq("email", email)
    .single();

  if (existente) {
    return Response.json({ error: "Este email ya esta registrado" }, { status: 409 });
  }

  const passwordHasheado = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from("maestros")
    .insert({ nombre, email, password: passwordHasheado, plan: "gratis" })
    .select()
    .single();

  if (error || !data) {
    return Response.json({ error: "Error al registrar" }, { status: 500 });
  }

  // No regresamos el password (ni hasheado) al cliente
  const { password: _omitido, ...maestroSinPassword } = data;

  return Response.json({ maestro: maestroSinPassword });
}