import { useState } from "react";
import { trackEvent } from "../helpers/tracking.js";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const buttonBase =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3.5 text-xs font-black uppercase tracking-normal transition duration-200 hover:-translate-y-px hover:border-white/25 hover:bg-white/10";
  const navLink = "transition-colors duration-200 hover:text-white";
  const LoginIcon = () => (
    <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-white/10 bg-[#080808]/85 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 min-[960px]:px-[52px]">
        <a className="flex items-center" href="/" aria-label="Jalu inicio" onClick={closeMenu}>
          <img className="block h-auto w-[104px]" src="/img/Logo-Jalu.png" alt="Jalu" />
        </a>

        <nav className="hidden gap-5 text-[0.9rem] font-extrabold text-[#b9b9b9] min-[960px]:flex" aria-label="Principal">
          <a className={navLink} href="/menu">Men&uacute;</a>
          <a className={navLink} href="/#arabe-libre">&Aacute;rabe libre</a>
          <a className={navLink} href="/reservas">Pedidos y reservas</a>
          <a className={navLink} href="/#club">Club Jalu</a>
          <a className={navLink} href="/sobre-nosotros">Sobre nosotros</a>
        </nav>

        <div className="hidden gap-2 min-[960px]:flex">
          <a
            className={`${buttonBase} bg-transparent text-white`}
            href="/reservas#pedidos"
            onClick={() => trackEvent("click_pedir_nav")}
          >
            Pedir
          </a>
          <a
            className={`${buttonBase} bg-transparent text-white`}
            href="/reservas#reservas"
            onClick={() => trackEvent("click_reservar_nav")}
          >
            Reservar
          </a>
          <a className={`${buttonBase} bg-transparent text-white`} href="/login">
            <LoginIcon />
            Iniciar sesi&oacute;n
          </a>
          <a className={`${buttonBase} bg-transparent text-white`} href="/register">
            Registrarse
          </a>
        </div>

        <button
          className="relative z-30 grid h-10 w-10 place-items-center rounded-md border border-white/10 text-white transition hover:border-white/25 hover:bg-white/10 min-[960px]:hidden"
          type="button"
          aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span className="relative h-5 w-6">
            <span
              className={`absolute left-0 top-0 h-0.5 w-6 rounded-full bg-current transition duration-300 ${
                isMenuOpen ? "translate-y-[9px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[9px] h-0.5 w-6 rounded-full bg-current transition duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[18px] h-0.5 w-6 rounded-full bg-current transition duration-300 ${
                isMenuOpen ? "-translate-y-[9px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-white/10 bg-[#080808]/95 px-4 transition-all duration-300 min-[960px]:hidden ${
          isMenuOpen ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-5 py-5 text-lg font-extrabold text-[#b9b9b9]" aria-label="Principal mobile">
          <a className={navLink} href="/menu" onClick={closeMenu}>Men&uacute;</a>
          <a className={navLink} href="/#arabe-libre" onClick={closeMenu}>&Aacute;rabe libre</a>
          <a className={navLink} href="/reservas" onClick={closeMenu}>Pedidos y reservas</a>
          <a className={navLink} href="/#club" onClick={closeMenu}>Club Jalu</a>
          <a className={navLink} href="/sobre-nosotros" onClick={closeMenu}>Sobre nosotros</a>
        </nav>

        <div className="grid gap-2 pb-6">
          <a
            className={`${buttonBase} w-full bg-transparent text-white`}
            href="/reservas#pedidos"
            onClick={() => {
              trackEvent("click_pedir_nav");
              closeMenu();
            }}
          >
            Pedir
          </a>
          <a
            className={`${buttonBase} w-full bg-transparent text-white`}
            href="/reservas#reservas"
            onClick={() => {
              trackEvent("click_reservar_nav");
              closeMenu();
            }}
          >
            Reservar
          </a>
          <a className={`${buttonBase} w-full bg-transparent text-white`} href="/login" onClick={closeMenu}>
            <LoginIcon />
            Iniciar sesion
          </a>
          <a className={`${buttonBase} w-full bg-transparent text-white`} href="/register" onClick={closeMenu}>
            Registrarse
          </a>
        </div>
      </div>
    </header>
  );
}
