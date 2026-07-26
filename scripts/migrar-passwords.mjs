// Script LOCAL - correr una sola vez con: node scripts/migrar-passwords.mjs
// No se despliega a Cloudflare, habla directo con Supabase usando la Service Role Key.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uuqedqpuajoolrmmidps.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("Falta la variable SUPABASE_SERVICE_ROLE_KEY. Corre el script asi:");
  console.error('  $env:SUPABASE_SERVICE_ROLE_KEY="tu_clave"; node scripts/migrar-passwords.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const ITERACIONES = 100_000;

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer, iterations: ITERACIONES, hash: "SHA-256" },
    keyMaterial,
    256
  );

  const saltB64 = Buffer.from(salt).toString("base64");
  const hashB64 = Buffer.from(hashBuffer).toString("base64");

  return `pbkdf2$${ITERACIONES}$${saltB64}$${hashB64}`;
}

function esHashPbkdf2(valor) {
  return valor.startsWith("pbkdf2$");
}

async function main() {
  const { data: maestros, error } = await supabase.from("maestros").select("id, password");

  if (error || !maestros) {
    console.error("Error al leer maestros:", error);
    process.exit(1);
  }

  console.log(`Encontrados ${maestros.length} maestros.`);

  for (const m of maestros) {
    if (esHashPbkdf2(m.password)) {
      console.log(`  id ${m.id}: ya hasheado, se salta`);
      continue;
    }

    const passwordHasheado = await hashPassword(m.password);
    const { error: errorUpdate } = await supabase
      .from("maestros")
      .update({ password: passwordHasheado })
      .eq("id", m.id);

    console.log(`  id ${m.id}: ${errorUpdate ? "ERROR - " + errorUpdate.message : "migrado correctamente"}`);
  }

  console.log("Migracion completa.");
}

main();