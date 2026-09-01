import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";

export default function AdminProtected({
  children,
  allowedRoles = [],
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verificarUsuario = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          role_id,
          roles (
            nombre
          )
        `)
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error verificando rol:", error);
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const rol = profile?.roles?.nombre;

      setAuthorized(allowedRoles.includes(rol));
      setLoading(false);
    };

    verificarUsuario();
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        Verificando acceso...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080808] px-6 text-center text-white">
        <h1 className="text-4xl font-black">
          Acceso denegado
        </h1>

        <p className="mt-3 text-gray-400">
          No tenés permisos para acceder a este panel.
        </p>

        <a
          href="/"
          className="mt-6 rounded-lg bg-[#e71921] px-6 py-3 font-bold text-white"
        >
          Volver al inicio
        </a>
      </div>
    );
  }

  return children;
}