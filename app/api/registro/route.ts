export const runtime = "edge";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { hashPassword } from "../../../lib/passwordHash";

export async function POST(request: Request) {
  const { nombre, email, password, aceptaTerminos } = await request.json();

  if (!nombre || !email || !password) {
    return Response.json({ error: "Faltan campos" }, { status: 400 });
  }

  if (!aceptaTerminos) {
    return Response.json(
      { error: "Debes aceptar los Terminos y el Aviso de Privacidad" },
      { status: 400 }
    );
  }

  const { data: existente } = await supabaseAdmin
    .from("maestros")
    .select("id")
    .eq("email", email)
    .single();

  if (existente) {
    return Response.json({ error: "Este email ya esta registrado" }, { status: 409 });
  }

  const passwordHasheado = await hashPassword(password);

  const { data, error } = await supabaseAdmin
    .from("maestros")
    .insert({
      nombre,
      email,
      password: passwordHasheado,
      plan: "gratis",
      terminos_aceptados_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    return Response.json({ error: "Error al registrar" }, { status: 500 });
  }

  const { password: _omitido, ...maestroSinPassword } = data;

  return Response.json({ maestro: maestroSinPassword });
}