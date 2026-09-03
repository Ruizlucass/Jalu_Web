import { supabase } from "../supabase.js";

export function getUserInitials(user) {
  const metadata = user?.user_metadata || {};
  const displayName =
    metadata.full_name ||
    metadata.name ||
    metadata.nombre ||
    metadata.display_name ||
    user?.email ||
    "Usuario";

  const cleanName = displayName.includes("@")
    ? displayName.split("@")[0].replace(/[._-]+/g, " ")
    : displayName;

  const words = cleanName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export async function getUserRole(userId) {
  if (!userId) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      roles (
        nombre
      )
    `)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error obteniendo rol:", error);
    return null;
  }

  return profile?.roles?.nombre || null;
}

export function getAdminPathForRole(role) {
  if (role === "superadmin") {
    return "/superadmin";
  }

  if (role === "admin") {
    return "/admin";
  }

  return null;
}
