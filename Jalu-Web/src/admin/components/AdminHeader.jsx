import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { supabase } from "../../supabase.js";
import { getUserInitials } from "../../utils/authProfile.js";

export default function AdminHeader({ config }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const cargarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setUser(session?.user ?? null);
      }
    };

    cargarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const userInitials = getUserInitials(user);
  const initialsTitle = user?.email || "Usuario activo";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080808]/90 backdrop-blur-2xl">
      <div className="flex min-h-[73px] items-center justify-between gap-3 px-4 py-3 sm:px-6 xl:px-8">
        <a href="/" className="flex items-center gap-3 lg:hidden" aria-label="Jalu inicio">
          <img className="h-auto w-[84px] sm:w-[92px]" src="/img/Logo-Jalu.png" alt="Jalu" />
        </a>

        <div className="hidden min-w-0 lg:block">
          <p className="text-xs font-black uppercase tracking-widest text-[#b9b9b9]/60">
            {config.label}
          </p>

          <h2 className="truncate text-lg font-black text-white">
            {config.title}
          </h2>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <a
            href="/"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-3 text-xs font-extrabold text-[#b9b9b9] transition hover:border-white/30 hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm lg:hidden"
          >
            Inicio
          </a>

          {user && (
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e71921]/60 bg-[#e71921] text-sm font-black text-white shadow-[0_12px_28px_rgba(231,25,33,0.28)]"
              aria-label="Usuario activo"
              title={initialsTitle}
            >
              {userInitials}
            </span>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:border-[#e71921]/60 hover:bg-[#e71921]/10 lg:hidden"
            aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="admin-header-menu"
          >
            {menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="admin-header-menu"
          className="grid gap-2 border-t border-white/10 bg-[#0b0b0b] px-4 py-3 lg:hidden"
          aria-label={`${config.title} mobile`}
        >
          {config.links.map((link) => (
            <MobileMenuLink
              key={link.href}
              {...link}
              basePath={config.basePath}
              onClick={() => setMenuOpen(false)}
            />
          ))}
        </nav>
      )}
    </header>
  );
}

function MobileMenuLink({ href, label, basePath, onClick }) {
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  const normalizedHref = href.replace(/\/$/, "") || "/";
  const isActive =
    normalizedHref === basePath
      ? currentPath === basePath
      : currentPath === normalizedHref;

  return (
    <a
      href={href}
      onClick={onClick}
      className={`block rounded-lg border px-4 py-3 text-sm font-black uppercase transition ${
        isActive
          ? "border-[#e71921] bg-[#e71921] text-white shadow-[0_14px_32px_rgba(231,25,33,0.2)]"
          : "border-white/10 bg-white/[0.04] text-[#b9b9b9] hover:border-[#e71921]/50 hover:text-white"
      }`}
    >
      {label}
    </a>
  );
}
