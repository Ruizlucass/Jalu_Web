export default function AdminSidebar({ config }) {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[#0b0b0b] p-5 lg:flex">
      <a href="/" className="mb-10 block" aria-label="Volver a Jalu">
        <img className="h-auto w-[116px]" src="/img/Logo-Jalu.png" alt="Jalu" />
      </a>

      <div className="mb-7">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#e71921]">
          {config.label}
        </p>

        <h1 className="mt-2 text-xl font-black uppercase leading-tight text-white">
          {config.title}
        </h1>
      </div>

      <nav className="flex-1 space-y-2" aria-label={config.title}>
        {config.links.map((link) => (
          <AdminLink key={link.href} {...link} basePath={config.basePath} />
        ))}
      </nav>

      <a
        href="/"
        className="mt-6 rounded-lg border border-white/10 px-4 py-3 text-left text-sm font-black text-[#b9b9b9] transition hover:border-[#e71921]/60 hover:bg-[#e71921]/10 hover:text-white"
      >
        Volver al sitio
      </a>
    </aside>
  );
}

function AdminLink({ href, label, basePath }) {
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  const normalizedHref = href.replace(/\/$/, "") || "/";
  const isActive =
    normalizedHref === basePath
      ? currentPath === basePath
      : currentPath === normalizedHref;

  return (
    <a
      href={href}
      className={`block rounded-lg border px-4 py-3 text-sm font-black uppercase transition ${
        isActive
          ? "border-[#e71921] bg-[#e71921] text-white shadow-[0_14px_32px_rgba(231,25,33,0.2)]"
          : "border-transparent text-[#b9b9b9] hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {label}
    </a>
  );
}
