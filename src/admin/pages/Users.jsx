import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../supabase.js";
import { AdminSection, DataRow, PageShell } from "../components/AdminUi.jsx";
import { panelConfigs } from "../data/adminData.js";
import { normalizeProfile, queryProfiles } from "../utils/userProfiles.js";

const statusFilters = [
  { value: "todos", label: "Ambos" },
  { value: "activo", label: "Activos" },
  { value: "inactivo", label: "Inactivos" },
];

export default function Users({ panelType = "superadmin" }) {
  const config = panelConfigs[panelType] || panelConfigs.superadmin;
  const [profiles, setProfiles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [savingUserId, setSavingUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const canManageRoles = panelType === "superadmin";

  const normalizedUsers = useMemo(
    () => profiles.map(normalizeProfile),
    [profiles]
  );

  const visibleUsers = useMemo(() => {
    if (statusFilter === "todos") {
      return normalizedUsers;
    }

    return normalizedUsers.filter(
      (user) => user.status.toLowerCase() === statusFilter
    );
  }, [normalizedUsers, statusFilter]);

  async function loadUsers() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [
        profilesResult,
        rolesResult,
        sessionResult,
      ] = await Promise.all([
        queryProfiles(),
        canManageRoles
          ? supabase
              .from("roles")
              .select("id, nombre")
              .order("nombre", { ascending: true })
          : Promise.resolve({ data: [], error: null }),
        supabase.auth.getSession(),
      ]);

      if (profilesResult.error) {
        throw profilesResult.error;
      }

      if (rolesResult.error) {
        throw rolesResult.error;
      }

      setProfiles(profilesResult.data || []);
      setRoles(rolesResult.data || []);
      setCurrentUserId(
        sessionResult.data?.session?.user?.id || ""
      );
    } catch (usersError) {
      console.error("Error obteniendo usuarios:", usersError);
      setError(
        "No se pudieron cargar los usuarios. Revisá las políticas de Supabase para la tabla profiles."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(user, roleId) {
    if (user.id === currentUserId) {
      setError("No podés cambiar tu propio rol desde esta pantalla.");
      setSuccess("");
      return;
    }

    setSavingUserId(user.id);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role_id: roleId })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) => {
          if (profile.id !== user.id) {
            return profile;
          }

          const selectedRole = roles.find(
            (role) => String(role.id) === String(roleId)
          );

          return {
            ...profile,
            role_id: roleId,
            roles: selectedRole
              ? { nombre: selectedRole.nombre }
              : profile.roles,
          };
        })
      );
      setSuccess(`Rol actualizado para ${user.name}.`);
    } catch (updateError) {
      console.error("Error actualizando rol:", updateError);
      setError(
        "No se pudo actualizar el rol. Revisá que Supabase permita esta acción solo a superadmin."
      );
    } finally {
      setSavingUserId("");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <PageShell
      eyebrow="Usuarios"
      title="Usuarios"
      description={`Vista del ${config.label.toLowerCase()} para revisar cuentas registradas y su estado.`}
    >
      <AdminSection
        eyebrow={config.label}
        title="Usuarios registrados"
        action="Actualizar"
        onAction={loadUsers}
        actionDisabled={loading}
      >
        <div className="mb-4 flex flex-col gap-2 sm:max-w-xs">
          <label
            htmlFor="users-status-filter"
            className="text-xs font-black uppercase tracking-[0.2em] text-gray-500"
          >
            Estado
          </label>
          <select
            id="users-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-h-11 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 text-sm font-bold text-white outline-none transition focus:border-[#e71921] focus:shadow-[0_0_0_3px_rgba(231,25,33,0.16)]"
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3">
          {loading && (
            <p className="rounded-lg border border-white/5 bg-white/[0.03] p-4 text-sm font-bold text-gray-400">
              Cargando usuarios...
            </p>
          )}

          {!loading && error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-200">
              {error}
            </p>
          )}

          {!loading && success && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold leading-6 text-emerald-200">
              {success}
            </p>
          )}

          {!loading && visibleUsers.length === 0 && (
            <p className="rounded-lg border border-white/5 bg-white/[0.03] p-4 text-sm font-bold text-gray-400">
              No hay usuarios para ese estado.
            </p>
          )}

          {!loading && visibleUsers.map((user) => (
            canManageRoles ? (
              <UserManagementRow
                key={user.id}
                user={user}
                roles={roles}
                currentUserId={currentUserId}
                savingUserId={savingUserId}
                onRoleChange={updateUserRole}
              />
            ) : (
              <DataRow
                key={user.id}
                title={user.name}
                meta={`${user.email} · ${user.role}`}
                status={user.status}
              />
            )
          ))}
        </div>
      </AdminSection>
    </PageShell>
  );
}

function UserManagementRow({
  user,
  roles,
  currentUserId,
  savingUserId,
  onRoleChange,
}) {
  const isCurrentUser = user.id === currentUserId;
  const isSaving = savingUserId === user.id;
  const disabled = isCurrentUser || isSaving || roles.length === 0;

  return (
    <article className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[minmax(0,1fr)_120px_220px] lg:items-center">
      <div className="min-w-0">
        <p className="truncate font-black text-white">
          {user.name}
          {isCurrentUser && (
            <span
              aria-label="Usuario actual"
              className="ml-2 inline-block size-2 rounded-full bg-[#e71921] align-middle"
              title="Usuario actual"
            >
              <span className="sr-only">Usuario actual</span>
            </span>
          )}
        </p>
        <p className="mt-1 truncate text-xs font-bold text-gray-500">
          {user.email}
        </p>
      </div>

      <UserStatusBadge status={user.status} />

      <select
        value={user.roleId}
        onChange={(event) => onRoleChange(user, event.target.value)}
        disabled={disabled}
        title={
          isCurrentUser
            ? "No podés cambiar tu propio rol"
            : "Cambiar rol"
        }
        className="min-h-11 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 text-sm font-bold text-white outline-none transition focus:border-[#e71921] focus:shadow-[0_0_0_3px_rgba(231,25,33,0.16)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!user.roleId && (
          <option value="">
            Sin rol
          </option>
        )}
        {roles.map((role) => (
          <option key={role.id} value={String(role.id)}>
            {role.nombre}
          </option>
        ))}
      </select>
    </article>
  );
}

function UserStatusBadge({ status }) {
  const normalizedStatus = String(status || "").toLowerCase();
  const statusClass =
    normalizedStatus === "activo"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      : normalizedStatus === "inactivo"
        ? "border-red-400/30 bg-red-400/10 text-red-300"
        : "border-white/10 bg-[#0f0f0f] text-[#b9b9b9]";

  return (
    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClass}`}>
      {status}
    </span>
  );
}
