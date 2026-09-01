import { panelConfigs, summaryCards } from "../data/adminData.js";
import { PageShell, SummaryCard } from "../components/AdminUi.jsx";

export default function Dashboard({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  return (
    <PageShell
      eyebrow={config.label}
      title={config.title}
      description={config.subtitle}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <SummaryCard key={item.id} item={item} />
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-[#151515] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e71921]">
          Resumen
        </p>
        <h2 className="mt-2 text-xl font-black uppercase text-white">
          Actividad del dia
        </h2>
        <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-[#b9b9b9]">
          Esta pantalla queda como vista rapida. Cada modulo tiene su propia
          pagina para editar o revisar informacion sin mezclar tareas.
        </p>
      </section>
    </PageShell>
  );
}
