import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ewvjqlmjksdegzrnstrw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Nc2BDDBxgeOfujSTDi2iPA_76GpKZx2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

