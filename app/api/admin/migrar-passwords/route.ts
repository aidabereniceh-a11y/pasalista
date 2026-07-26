export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { hashPassword, esHashPbkdf2 } from "../../../../lib/passwordHash";

// ⚠️ ENDPOINT TEMPORAL - Borrar este archivo despues de usarlo una vez.
export async function POST(request: Request) {
  const { claveSecreta } = await request.json();

  if (claveSecreta !== process.env.MIGRACION_SECRETA) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: maestros, error } = await supabaseAdmin
    .from("maestros")
    .select("id, password");

  if (error || !maestros) {
    return Response.json({ error: "No se pudo leer maestros" }, { status: 500 });
  }

  const resultados = [];

  for (const m of maestros) {
    if (esHashPbkdf2(m.password)) {
      resultados.push({ id: m.id, estado: "ya_hasheado" });
      continue;
    }

    const passwordHasheado = await hashPassword(m.password);
    const { error: errorUpdate } = await supabaseAdmin
      .from("maestros")
      .update({ password: passwordHasheado })
      .eq("id", m.id);

    resultados.push({ id: m.id, estado: errorUpdate ? "error" : "migrado" });
  }

  return Response.json({ resultados });
}