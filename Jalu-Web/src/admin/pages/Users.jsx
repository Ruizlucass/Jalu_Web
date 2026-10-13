import { users } from "../data/adminData.js";
import { AdminSection, DataRow, PageShell } from "../components/AdminUi.jsx";

export default function Users() {
  return (
    <PageShell
      eyebrow="Usuarios"
      title="Usuarios"
      description="Vista del superadmin para revisar cuentas registradas y su estado."
    >
      <AdminSection eyebrow="Superadmin" title="Usuarios registrados">
        <div className="grid gap-3">
          {users.map((user) => (
            <DataRow
              key={user.id}
              title={user.name}
              meta={user.email}
              status={user.status}
            />
          ))}
        </div>
      </AdminSection>
    </PageShell>
  );
}
