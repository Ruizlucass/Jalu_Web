import Button from "./Button.jsx";
import { branches, whatsappBase } from "../utils/siteData.js";
import { trackEvent } from "../helpers/tracking.js";

export function ArabicFree() {
  return (
    <section id="arabe-libre" className="arabic-free">
      <div className="arabic-free-media" aria-label="Mesa con comida árabe" />
      <div className="arabic-free-content">
        <span className="eyebrow">Árabe libre</span>
        <h2>Vení con hambre</h2>
        <p>
          Comé todo lo que quieras: sfijas, kipes, shawarma, tablas, salsas y dulces.
          Experiencia de salón para compartir.
        </p>
        <Button variant="dark" href="#reservas" onClick={() => trackEvent("click_reservar_arabe_libre")}>
          Reservar mesa
        </Button>
      </div>
    </section>
  );
}

export function OrdersAndReservations() {
  return (
    <section className="section split-grid">
      <div id="pedidos" className="order-panel">
        <h2 className="panel-title">Pedidos</h2>
        <p>UX simple: elegís sucursal, elegís canal y salís a WhatsApp, PedidosYa o Rappi.</p>
        <div className="form-grid">
          <select className="field" defaultValue="">
            <option value="" disabled>Elegir sucursal</option>
            {branches.map((branch) => (
              <option key={branch.name}>{branch.name}</option>
            ))}
          </select>
          <Button href={whatsappBase} onClick={() => trackEvent("click_pedido_whatsapp")}>
            Pedir por WhatsApp
          </Button>
          <Button variant="outline" href="#" onClick={() => trackEvent("click_pedido_apps")}>
            Ver apps
          </Button>
        </div>
      </div>

      <div id="reservas" className="reserve-panel">
        <h2 className="panel-title">Reservas</h2>
        <p>Formulario corto y botón directo a WhatsApp para confirmar mesa.</p>
        <div className="form-grid">
          <input className="field" placeholder="Nombre" />
          <input className="field" placeholder="Teléfono" />
          <input className="field" placeholder="Cantidad de personas" />
          <input className="field" type="date" />
          <input className="field" type="time" />
          <Button href={whatsappBase} onClick={() => trackEvent("click_reserva_form")}>
            Reservar por WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Club() {
  return (
    <section id="club" className="section">
      <div className="club-panel">
        <span className="eyebrow">Promos / Club Jalu</span>
        <h2 className="panel-title">Descuentos que vuelven</h2>
        <p>2x1, combos por sucursal y registro por email o WhatsApp para activar clientes recurrentes.</p>
        <div className="form-grid">
          <input className="field" placeholder="Email o WhatsApp" />
          <Button onClick={() => trackEvent("click_club_jalu")}>Entrar al club</Button>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="section final-cta">
      <div>
        <h2>¿Qué vas a comer hoy?</h2>
      </div>
    </section>
  );
}
