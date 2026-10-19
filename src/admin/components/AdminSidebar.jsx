import {
  FaArrowLeft,
  FaBan,
  FaCalendarAlt,
  FaCheckCircle,
  FaCircle,
  FaShoppingBag,
  FaTags,
  FaTachometerAlt,
  FaUtensils,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";

const sectionIcons = {
  dashboard: FaTachometerAlt,
  menu: FaUtensils,
  promociones: FaTags,
  reservas: FaCalendarAlt,
  pedidos: FaShoppingBag,
  finalizados: FaCheckCircle,
  cancelados: FaBan,
  usuarios: FaUsers,
  roles: FaUserShield,
};

export default function AdminSidebar({ config, currentPathname }) {
  return (
    <aside className="hidden min-h-screen w-[292px] shrink-0 flex-col border-r border-white/[0.07] bg-gradient-to-b from-[#111111] via-[#0b0b0b] to-[#080808] p-5 lg:flex">
      <a
        href="/"
        className="mb-9 flex min-h-16 items-center rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 transition hover:border-white/10 hover:bg-white/[0.045]"
        aria-label="Volver a Jalu"
      >
        <img className="h-auto w-[108px]" src="/img/Logo-Jalu.png" alt="Jalu" />
      </a>

      <div className="mb-5 px-1">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#e71921]">
          {config.label} · Gestión
        </p>
      </div>

      <nav className="flex-1 space-y-1.5" aria-label={config.title}>
        {config.links.map((link) => (
          <AdminLink
            key={link.href}
            {...link}
            basePath={config.basePath}
            currentPathname={currentPathname}
          />
        ))}
      </nav>

      <a
        href="/"
        className="mt-6 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[#858585] transition hover:bg-white/[0.05] hover:text-white"
      >
        <FaArrowLeft className="text-xs" aria-hidden="true" />
        Volver al sitio
      </a>
    </aside>
  );
}

function AdminLink({ href, label, basePath, currentPathname }) {
  const currentPath = currentPathname || window.location.pathname.replace(/\/$/, "") || "/";
  const normalizedHref = href.replace(/\/$/, "") || "/";
  const isActive =
    normalizedHref === basePath
      ? currentPath === basePath
      : currentPath === normalizedHref;
  const section = normalizedHref.slice(basePath.length).replace(/^\//, "") || "dashboard";
  const Icon = sectionIcons[section] || FaCircle;

  return (
    <a
      href={href}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (href === window.location.pathname) {
          event.preventDefault();
          window.history.replaceState(
            { ...window.history.state, panelPath: href },
            "",
            window.location.pathname
          );
          window.location.reload();
        }
      }}
      aria-current={isActive ? "page" : undefined}
      className={`group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-xl px-3 text-[13px] font-bold transition ${
        isActive
          ? "bg-[#e71921]/[0.13] text-white shadow-[inset_0_0_0_1px_rgba(231,25,33,0.18)]"
          : "text-[#999999] hover:bg-white/[0.045] hover:text-white"
      }`}
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg transition ${isActive ? "bg-[#e71921] text-white shadow-[0_6px_18px_rgba(231,25,33,0.28)]" : "bg-white/[0.045] text-[#777] group-hover:bg-white/[0.08] group-hover:text-white"}`}>
        <Icon aria-hidden="true" className="text-sm" />
      </span>
      {label}
      {isActive && <span className="ml-auto size-1.5 rounded-full bg-[#ff555b]" />}
    </a>
  );
}
