// Script LOCAL - correr una sola vez con: node scripts/reset-password.mjs
// Requiere las variables de entorno EMAIL_A_RESETEAR, NUEVA_PASSWORD y SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uuqedqpuajoolrmmidps.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = process.env.EMAIL_A_RESETEAR;
const NUEVA_PASSWORD = process.env.NUEVA_PASSWORD;

if (!SERVICE_ROLE_KEY || !EMAIL || !NUEVA_PASSWORD) {
  console.error("Faltan variables de entorno. Corre el script asi:");
  console.error(
    '  $env:SUPABASE_SERVICE_ROLE_KEY="tu_clave"; $env:EMAIL_A_RESETEAR="correo@ejemplo.com"; $env:NUEVA_PASSWORD="nueva_contrasena"; node scripts/reset-password.mjs'
  );
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

async function main() {
  const { data: maestro, error: errorBusqueda } = await supabase
    .from("maestros")
    .select("id, email")
    .eq("email", EMAIL)
    .single();

  if (errorBusqueda || !maestro) {
    console.error("No se encontro ningun maestro con ese email.");
    process.exit(1);
  }

  const passwordHasheado = await hashPassword(NUEVA_PASSWORD);

  const { error } = await supabase
    .from("maestros")
    .update({ password: passwordHasheado })
    .eq("id", maestro.id);

  if (error) {
    console.error("Error al actualizar:", error.message);
    process.exit(1);
  }

  console.log(`Contrasena actualizada correctamente para ${EMAIL} (id ${maestro.id}).`);
}

main();