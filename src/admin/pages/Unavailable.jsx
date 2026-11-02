import { PageShell } from "../components/AdminUi.jsx";

export default function Unavailable({ panelType = "admin" }) {
  return (
    <PageShell
      eyebrow={panelType === "superadmin" ? "Superadmin" : "Admin"}
      title="Seccion no disponible"
    >
      <a
        href={panelType === "superadmin" ? "/superadmin" : "/admin"}
        className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg border border-[#e71921] bg-[#e71921] px-5 text-sm font-black uppercase text-white shadow-[0_14px_32px_rgba(231,25,33,0.22)] transition hover:border-[#ff2a33] hover:bg-[#ff2a33]"
      >
        Volver al dashboard
      </a>
    </PageShell>
  );
}
