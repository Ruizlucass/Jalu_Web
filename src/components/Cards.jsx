import { useState } from "react";
import Button from "./Button.jsx";
import { menuCategories, products, quickLinks, whatsappBase } from "../utils/siteData.js";
import { trackEvent } from "../helpers/tracking.js";

export function QuickAccess() {
  return (
    <section className="section">
      <div className="quick-grid">
        {quickLinks.map((link) => (
          <a className="quick-card" href={link.href} key={link.label}>
            {link.label}
            <span>+</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image" style={{ backgroundImage: `url(${product.image})` }} />
      <div className="product-body">
        <div className="product-top">
          <h3>{product.name}</h3>
          <span className="price">{product.price}</span>
        </div>
        <p>{product.desc}</p>
        <Button href={whatsappBase} onClick={() => trackEvent(`click_pedir_${product.name}`)}>
          Pedir por WhatsApp
        </Button>
      </div>
    </article>
  );
}

export function MenuPreview() {
  const [active, setActive] = useState("Combos");
  const visibleProducts = products.filter((product) => product.category === active);

  return (
    <section id="menu" className="section">
      <div className="section-header">
        <div>
          <span className="eyebrow">Menú delivery / take away</span>
          <h2 className="section-title">Pedilo rápido</h2>
        </div>
        <p className="section-note">
          Categorías claras, foto, precio y CTA directo a WhatsApp o app. Para salón,
          se puede mostrar una versión más descriptiva y menos agresiva.
        </p>
      </div>

      <div className="menu-tabs" role="tablist" aria-label="Categorías de menú">
        {menuCategories.map((category) => (
          <button
            className={`tab ${active === category ? "active" : ""}`}
            key={category}
            onClick={() => setActive(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {(visibleProducts.length ? visibleProducts : products.slice(0, 4)).map((product) => (
          <ProductCard product={product} key={product.name} />
        ))}
      </div>
    </section>
  );
}

export function Combos() {
  const featured = products.filter((product) =>
    ["Shawarma", "Combos", "Sfijas", "Dulces árabes"].includes(product.category)
  );

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <span className="eyebrow">Combos destacados</span>
          <h2 className="section-title">Los que salen más</h2>
        </div>
      </div>
      <div className="product-grid">
        {featured.map((product) => (
          <ProductCard product={product} key={`combo-${product.name}`} />
        ))}
      </div>
    </section>
  );
}
