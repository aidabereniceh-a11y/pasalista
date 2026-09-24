// Colocar en: lib/verificarPremium.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Revisa en la base de datos (no en el navegador) si el maestro tiene Premium vigente
export async function esPremium(maestroId: string | number | null | undefined): Promise<boolean> {
  if (!maestroId) return false;

  const { data, error } = await supabaseAdmin
    .from("maestros")
    .select("plan, premium_hasta")
    .eq("id", maestroId)
    .single();

  if (error || !data) return false;
  if (data.plan !== "premium") return false;
  if (data.premium_hasta && new Date(data.premium_hasta) < new Date()) return false;

  return true;
}

export const respuestaNoPremium = {
  error: "Esta función es solo para maestros con plan Premium ($49/mes).",
};