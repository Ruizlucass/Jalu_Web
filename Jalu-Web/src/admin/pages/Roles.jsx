import { useState } from "react";
import { roleOptions, users } from "../data/adminData.js";
import { AdminSection, PageShell } from "../components/AdminUi.jsx";

export default function Roles() {
  const [visualRoles, setVisualRoles] = useState(
    users.reduce((rolesByUser, user) => {
      rolesByUser[user.id] = user.role;
      return rolesByUser;
    }, {})
  );

  return (
    <PageShell
      eyebrow="Roles"
      title="Cambiar rol de usuario"
      description="Pantalla visual para preparar el cambio de rol entre cliente, admin y superadmin."
    >
      <AdminSection eyebrow="Superadmin" title="Roles de usuarios">
        <div className="grid gap-3">
          {users.map((user) => (
            <article
              key={user.id}
              className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate font-black text-white">{user.name}</p>
                <p className="mt-1 truncate text-xs font-bold text-gray-500">
                  {user.email}
                </p>
              </div>

              <select
                value={visualRoles[user.id]}
                onChange={(event) =>
                  setVisualRoles({
                    ...visualRoles,
                    [user.id]: event.target.value,
                  })
                }
                className="min-h-11 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 text-sm font-bold text-white outline-none transition focus:border-[#e71921] focus:shadow-[0_0_0_3px_rgba(231,25,33,0.16)]"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-[#e71921]/30 bg-[#e71921]/10 p-4">
          <p className="text-sm font-bold leading-6 text-gray-300">
            Esta pantalla es solo visual por ahora. No guarda cambios ni
            modifica permisos reales.
          </p>
        </div>
      </AdminSection>
    </PageShell>
  );
}
