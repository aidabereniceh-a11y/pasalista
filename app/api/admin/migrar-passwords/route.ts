export const runtime = "edge";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import bcrypt from "bcryptjs";

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
    // Si ya empieza con $2 (formato bcrypt), ya esta hasheado - lo saltamos
    if (m.password.startsWith("$2")) {
      resultados.push({ id: m.id, estado: "ya_hasheado" });
      continue;
    }

    const passwordHasheado = await bcrypt.hash(m.password, 10);
    const { error: errorUpdate } = await supabaseAdmin
      .from("maestros")
      .update({ password: passwordHasheado })
      .eq("id", m.id);

    resultados.push({ id: m.id, estado: errorUpdate ? "error" : "migrado" });
  }

  return Response.json({ resultados });
}