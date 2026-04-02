import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseVerfuegbar =
  !!supabaseUrl && supabaseUrl !== "https://placeholder.supabase.co";

export const supabase =
  supabaseVerfuegbar && supabaseAnonKey
    ? createClient(supabaseUrl!, supabaseAnonKey)
    : null;
