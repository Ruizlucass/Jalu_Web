import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../supabase.js";
import { AdminSection, PageShell } from "../components/AdminUi.jsx";
import { normalizeProfile, queryProfiles } from "../utils/userProfiles.js";

export default function Roles() {
  const [profiles, setProfiles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [savingUserId, setSavingUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const users = useMemo(
    () => profiles.map(normalizeProfile),
    [profiles]
  );

  async function loadData() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [profilesResult, rolesResult] = await Promise.all([
        queryProfiles(),
        supabase
          .from("roles")
          .select("id, nombre")
          .order("nombre", { ascending: true }),
      ]);

      if (profilesResult.error) {
        throw profilesResult.error;
      }

      if (rolesResult.error) {
        throw rolesResult.error;
      }

      setProfiles(profilesResult.data || []);
      setRoles(rolesResult.data || []);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setCurrentUserId(session?.user?.id || "");
    } catch (loadError) {
      console.error("Error cargando roles:", loadError);
      setError(
        "No se pudieron cargar usuarios o roles. Revisá las políticas de Supabase."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId, roleId) {
    if (userId === currentUserId) {
      setError("No podés cambiar tu propio rol desde esta pantalla.");
      setSuccess("");
      return;
    }

    setSavingUserId(userId);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role_id: roleId })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) => {
          if (profile.id !== userId) {
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
      setSuccess("Rol actualizado correctamente.");
    } catch (updateError) {
      console.error("Error actualizando rol:", updateError);
      setError(
        "No se pudo actualizar el rol. Confirmá que el usuario actual sea superadmin y tenga permiso de update en profiles."
      );
    } finally {
      setSavingUserId("");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <PageShell
      eyebrow="Roles"
      title="Cambiar rol de usuario"
      description="Solo el superadmin puede modificar permisos reales de usuarios."
    >
      <AdminSection
        eyebrow="Superadmin"
        title="Roles de usuarios"
        action="Actualizar"
        onAction={loadData}
        actionDisabled={loading}
      >
        <div className="grid gap-3">
          {loading && (
            <p className="rounded-lg border border-white/5 bg-white/[0.03] p-4 text-sm font-bold text-gray-400">
              Cargando roles...
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

          {!loading && users.length === 0 && (
            <p className="rounded-lg border border-white/5 bg-white/[0.03] p-4 text-sm font-bold text-gray-400">
              Todavía no hay usuarios registrados.
            </p>
          )}

          {!loading && users.map((user) => (
            <RoleRow
              key={user.id}
              user={user}
              roles={roles}
              currentUserId={currentUserId}
              savingUserId={savingUserId}
              onRoleChange={updateUserRole}
            />
          ))}
        </div>
      </AdminSection>
    </PageShell>
  );
}

function RoleRow({
  user,
  roles,
  currentUserId,
  savingUserId,
  onRoleChange,
}) {
  const isCurrentUser = user.id === currentUserId;
  const disabled =
    isCurrentUser ||
    savingUserId === user.id ||
    roles.length === 0;

  return (
    <article className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
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

      <select
        value={user.roleId}
        onChange={(event) =>
          onRoleChange(user.id, event.target.value)
        }
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
