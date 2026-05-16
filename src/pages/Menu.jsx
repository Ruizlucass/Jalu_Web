import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { ProductCard } from "../components/Cards.jsx";
import Footer from "../components/Footer.jsx";
import WspFlotante from "../components/WspFlotante.jsx";
import { menuCategories, products } from "../utils/siteData.js";

export default function Menu() {
  const [active, setActive] = useState("Combos");
  const visibleProducts = products.filter((product) => product.category === active);

  return (
    <main className="app page-shell">
      <Navbar />

      <section className="section menu-page">
        <div className="section-header">
          <div>
            <span className="eyebrow">Menu delivery / take away</span>
            <h1 className="section-title">Elegi tu pedido</h1>
          </div>
          <p className="section-note">
            Todas las opciones de Jalu reunidas en una pagina aparte, con categorias
            claras para pedir rapido por WhatsApp.
          </p>
        </div>

        <div className="menu-tabs" role="tablist" aria-label="Categorias de menu">
          {menuCategories.map((category) => (
            <button
              className={`tab ${active === category ? "active" : ""}`}
              key={category}
              onClick={() => setActive(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {(visibleProducts.length ? visibleProducts : products).map((product) => (
            <ProductCard product={product} key={product.name} />
          ))}
        </div>
      </section>

      <Footer />
      <WspFlotante />
    </main>
  );
}
