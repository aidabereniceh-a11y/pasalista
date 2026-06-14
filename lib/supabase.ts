import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uuqedqpuajoolrmmidps.supabase.co";
const supabaseAnonKey = "sb_publishable_sS-yKk-pQxD-2vMYNhgRsQ_1nqBGXst";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
