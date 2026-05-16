import Button from "./Button.jsx";
import { branches } from "../utils/siteData.js";
import { trackEvent } from "../helpers/tracking.js";

export default function Sucursales() {
  return (
    <section id="sucursales" className="section">
      <div className="section-header featured-section-header">
        <div>
          <span className="eyebrow">Sucursales</span>
          <h2 className="section-title">Siempre cerca</h2>
        </div>
        <p className="section-note">
          En la versión final cada sucursal puede incluir mapa embebido, horarios
          reales y enlaces propios de pedir o reservar.
        </p>
      </div>

      <div className="branch-grid">
        {branches.slice(0, 3).map((branch) => (
          <article className="branch-card" key={branch.name}>
            <span className="branch-zone">{branch.zone}</span>
            <h3>{branch.name}</h3>
            <p>
              {branch.address}
              <br />
              Todos los días 12:00 a 00:00
            </p>
            <div className="branch-actions">
              <Button variant="outline" href="https://maps.google.com">
                Cómo llegar
              </Button>
              <Button href="#pedidos" onClick={() => trackEvent(`click_pedir_${branch.name}`)}>
                Pedir
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
