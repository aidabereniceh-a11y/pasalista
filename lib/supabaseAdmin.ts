import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uuqedqpuajoolrmmidps.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ⚠️ Este cliente usa la Service Role Key y puede saltarse RLS.
// NUNCA lo importes en un archivo con "use client" ni lo expongas al navegador.
// Solo se usa dentro de rutas app/api/*.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);