import Button from "./Button.jsx";
import { trackEvent } from "../helpers/tracking.js";

export default function Navbar() {
  return (
    <header className="nav">
      <a className="brand" href="#home" aria-label="Jalu inicio">
        <img src="/img/Logo-jalu.png" alt="Jalu" />
      </a>

      <nav className="nav-links" aria-label="Principal">
        <a href="#menu">Menú</a>
        <a href="#arabe-libre">Árabe libre</a>
        <a href="#sucursales">Sucursales</a>
        <a href="#club">Club Jalu</a>
      </nav>

      <div className="nav-actions">
        <Button variant="ghost" href="#pedidos" onClick={() => trackEvent("click_pedir_nav")}>
          Pedir
        </Button>
        <Button variant="outline" href="#reservas" onClick={() => trackEvent("click_reservar_nav")}>
          Reservar
        </Button>
      </div>
    </header>
  );
}
