import { supabaseAdmin } from "./supabaseAdmin";

/**
 * Revisa si un grupo debe estar bloqueado para acciones activas
 * (tomar asistencia, marcar banio, agregar alumnos) por el limite
 * del plan gratis.
 *
 * Regla: si el maestro es "gratis", solo su grupo mas antiguo
 * (el primero que creo) queda activo. Los demas grupos que haya
 * conservado de cuando era premium quedan bloqueados, pero
 * conservan su historial de asistencia (no se borra nada).
 *
 * Si el maestro es "premium", nunca bloquea.
 */
export async function grupoEstaBloqueado(
  grupoId: string | number,
  maestroId: string | number
): Promise<boolean> {
  const { data: maestro } = await supabaseAdmin
    .from("maestros")
    .select("plan")
    .eq("id", maestroId)
    .single();

  // Si es premium (o no se encontro el maestro, por seguridad no bloqueamos
  // aqui: la verificacion de "es dueno" en cada endpoint ya cubre ese caso)
  if (!maestro || maestro.plan !== "gratis") return false;

  const { data: grupoMasAntiguo } = await supabaseAdmin
    .from("grupos")
    .select("id")
    .eq("maestro_id", maestroId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!grupoMasAntiguo) return false;

  return String(grupoMasAntiguo.id) !== String(grupoId);
}