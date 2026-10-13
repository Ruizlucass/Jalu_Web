import Button from "./Button.jsx";
import { products, quickLinks, whatsappBase } from "../utils/siteData.js";
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

export function Combos() {
  const featured = products.filter((product) =>
    ["Shawarma", "Combos", "Sfijas", "Dulces arabes"].includes(product.category)
  );

  return (
    <section className="section">
      <div className="section-header featured-section-header">
        <div>
          <span className="eyebrow">Combos destacados</span>
          <h2 className="section-title">Los que salen mas</h2>
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
