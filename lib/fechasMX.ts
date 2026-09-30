// Colocar en: lib/fechasMX.ts
// Utilidades de fecha en hora de México (centro, UTC-6, sin horario de verano desde 2022).
// El servidor de Cloudflare trabaja en UTC; con esto "hoy" siempre es el día de México.

const OFFSET_MX = "-06:00";
const MS_POR_HORA = 60 * 60 * 1000;
const MS_POR_DIA = 24 * MS_POR_HORA;

// "2026-09-30" según la hora de México
export function hoyMX(): string {
  return new Date(Date.now() - 6 * MS_POR_HORA).toISOString().slice(0, 10);
}

export function esFechaValida(dia: string | null | undefined): dia is string {
  if (!dia || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  return !isNaN(new Date(`${dia}T00:00:00${OFFSET_MX}`).getTime());
}

// Inicio y fin (en ISO/UTC) de un día completo de México, para filtrar en Supabase
export function rangoDiaMX(dia: string): { inicio: string; fin: string } {
  const inicio = new Date(`${dia}T00:00:00${OFFSET_MX}`);
  const fin = new Date(inicio.getTime() + MS_POR_DIA);
  return { inicio: inicio.toISOString(), fin: fin.toISOString() };
}

// Hora que se guarda al corregir un día pasado: 8:00 am de ese día (hora de México)
export function horaRegistroDiaPasado(dia: string): string {
  return new Date(`${dia}T08:00:00${OFFSET_MX}`).toISOString();
}