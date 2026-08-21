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
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden px-6 pt-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e71921]/12 via-transparent to-[#080808]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="mb-5 inline-block text-sm font-black uppercase tracking-[0.35em] text-[#e71921]">
            Menu delivery / take away
          </span>

          <h1 className="text-5xl font-black uppercase leading-none sm:text-6xl md:text-8xl">
            Elegi tu pedido
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base font-bold leading-7 text-gray-300 sm:text-lg">
            Todas las opciones de Jalu reunidas en una pagina aparte, con categorias
            claras para pedir rapido por WhatsApp.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
            Nuestros sabores
          </span>

          <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
            Categorias
          </h2>
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
