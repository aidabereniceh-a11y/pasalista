// Hasheo de contraseñas con PBKDF2 usando Web Crypto API (nativo del runtime edge).
// No agrega peso al Worker, a diferencia de bcryptjs.

const ITERACIONES = 100_000;

function bufferABase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binario = "";
  for (let i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]);
  return btoa(binario);
}

function base64ABuffer(base64: string): Uint8Array {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
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
    { name: "PBKDF2", salt, iterations: ITERACIONES, hash: "SHA-256" },
    keyMaterial,
    256
  );

  const saltB64 = bufferABase64(salt.buffer as ArrayBuffer);
  const hashB64 = bufferABase64(hashBuffer);

  // Formato: pbkdf2$iteraciones$salt$hash
  return `pbkdf2$${ITERACIONES}$${saltB64}$${hashB64}`;
}

export async function verifyPassword(password: string, hashGuardado: string): Promise<boolean> {
  // Compatibilidad: si el hash guardado no tiene nuestro formato (ej. texto plano viejo
  // que no se migró, o algo inesperado), simplemente no coincide.
  const partes = hashGuardado.split("$");
  if (partes.length !== 4 || partes[0] !== "pbkdf2") return false;

  const [, iteracionesStr, saltB64, hashB64Guardado] = partes;
  const iteraciones = parseInt(iteracionesStr, 10);
  const salt = base64ABuffer(saltB64);
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: iteraciones, hash: "SHA-256" },
    keyMaterial,
    256
  );

  const hashB64Calculado = bufferABase64(hashBuffer);
  return hashB64Calculado === hashB64Guardado;
}

export function esHashPbkdf2(valor: string): boolean {
  return valor.startsWith("pbkdf2$");
}