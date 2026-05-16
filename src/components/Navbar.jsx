import { trackEvent } from "../helpers/tracking.js";

export default function Navbar() {
  const buttonBase =
    "inline-flex min-h-[46px] items-center justify-center rounded-md px-[18px] text-sm font-black uppercase tracking-normal transition duration-200 hover:-translate-y-px";

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-[#080808]/85 px-4 py-3.5 backdrop-blur-2xl min-[960px]:px-[52px]">
      <a className="flex items-center" href="#home" aria-label="Jalu inicio">
        <img className="block h-auto w-[118px]" src="/img/Logo-Jalu.png" alt="Jalu" />
      </a>

      <nav className="hidden gap-[22px] text-[0.92rem] font-extrabold text-[#b9b9b9] min-[960px]:flex" aria-label="Principal">
        <a href="#menu">Men&uacute;</a>
        <a href="#arabe-libre">&Aacute;rabe libre</a>
        <a href="#sucursales">Sucursales</a>
        <a href="#club">Club Jalu</a>
      </nav>

      <div className="flex gap-2">
        <a
          className={`${buttonBase} hidden text-white min-[960px]:inline-flex`}
          href="#pedidos"
          onClick={() => trackEvent("click_pedir_nav")}
        >
          Pedir
        </a>
        <a
          className={`${buttonBase} border border-white/10 bg-transparent text-white max-[420px]:hidden`}
          href="#reservas"
          onClick={() => trackEvent("click_reservar_nav")}
        >
          Reservar
        </a>
      </div>
    </header>
  );
}
