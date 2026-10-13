import { createClient } from "@supabase/supabase-js";

// Vite solo expone variables con prefijo VITE_ y carga .env desde la raiz
// del proyecto (la carpeta donde se ejecuta npm run dev).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/+$/, "");
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "No se pudo cargar la configuracion de Supabase. Verifica que .env.local este dentro de la carpeta Jalu-Web, que contenga VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY, y reinicia Vite con npm run dev."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
