import { supabase } from "../../supabase.js";

const nameColumns = ["name", "nombre", "full_name", "display_name"];
const statusColumns = ["activo", "is_active", "active", "status", "estado"];

const profileSelects = [
  `
    id,
    nombre,
    role_id,
    created_at,
    roles (
      nombre
    )
  `,
  ...buildProfileSelects({ includeEmail: true }),
  ...buildProfileSelects({ includeEmail: false }),
  `
    id,
    role_id,
    roles (
      nombre
    )
  `,
];

export async function queryProfiles() {
  let lastResult = null;

  for (const select of profileSelects) {
    let request = supabase
      .from("profiles")
      .select(select);

    if (select.includes("created_at")) {
      request = request.order("created_at", { ascending: false });
    }

    const result = await request;

    if (!result.error) {
      return result;
    }

    lastResult = result;
  }

  return lastResult;
}

function buildProfileSelects({ includeEmail }) {
  const baseColumns = includeEmail
    ? ["id", "role_id", "email"]
    : ["id", "role_id"];
  const selects = [];

  for (const nameColumn of nameColumns) {
    for (const statusColumn of statusColumns) {
      selects.push(formatSelect([...baseColumns, nameColumn, statusColumn]));
    }

    selects.push(formatSelect([...baseColumns, nameColumn]));
  }

  for (const statusColumn of statusColumns) {
    selects.push(formatSelect([...baseColumns, statusColumn]));
  }

  selects.push(formatSelect(baseColumns));

  return selects;
}

function formatSelect(columns) {
  return `
    ${columns.join(",\n    ")},
    roles (
      nombre
    )
  `;
}

export function normalizeProfile(profile) {
  const email = profile?.email || "Sin email registrado";
  const name =
    profile?.name ||
    profile?.nombre ||
    profile?.full_name ||
    getNameFromEmail(email) ||
    "Sin nombre registrado";

  return {
    id: profile?.id || email,
    roleId: profile?.role_id ? String(profile.role_id) : "",
    name,
    email,
    role: profile?.roles?.nombre || "cliente",
    status: getProfileStatus(profile),
  };
}

function getProfileStatus(profile) {
  const statusValue =
    profile?.activo ??
    profile?.is_active ??
    profile?.active ??
    profile?.status ??
    profile?.estado;

  if (typeof statusValue === "boolean") {
    return statusValue ? "Activo" : "Inactivo";
  }

  if (typeof statusValue === "string") {
    const normalizedStatus = statusValue.trim().toLowerCase();

    if (
      ["false", "inactivo", "inactive", "disabled", "bloqueado"].includes(
        normalizedStatus
      )
    ) {
      return "Inactivo";
    }

    if (
      ["true", "activo", "active", "enabled", "habilitado"].includes(
        normalizedStatus
      )
    ) {
      return "Activo";
    }
  }

  return "Activo";
}

function getNameFromEmail(email) {
  if (!email || !email.includes("@")) {
    return "";
  }

  return email.split("@")[0].replace(/[._-]+/g, " ");
}
