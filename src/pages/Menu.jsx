import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { ProductCard } from "../components/Cards.jsx";
import Footer from "../components/Footer.jsx";
import WspFlotante from "../components/WspFlotante.jsx";
import { menuCategories, products as fallbackProducts } from "../utils/siteData.js";
import { supabase } from "../supabase.js";

export default function Menu() {
    console.log("SE CARGO MENU JSX");
  const [active, setActive] = useState("Combos");
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersLoadError, setOffersLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

 const loadProducts = useCallback(async () => {
  console.log("SE EJECUTA LOADPRODUCTS");

  setLoading(true);
  setLoadError(false);

    try {
      const { data, error } = await supabase
        .from("menu_productos")
        .select(
          "id, nombre, descripcion, precio, categoria, imagen_url, disponible"
        )
        .eq("disponible", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      console.log("Productos recibidos de Supabase:", data);

      // Adaptamos los nombres de Supabase al formato
      // que ya utiliza el componente ProductCard.
      const formattedProducts = (data || []).map((product) => ({
        id: product.id,
        name: product.nombre,
        desc: product.descripcion || "",
        price: new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
          maximumFractionDigits: 2,
        }).format(Number(product.precio) || 0),
        image: product.imagen_url || "",
        category: product.categoria,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error cargando el menú de Supabase:", error);

      // Si Supabase falla, mantenemos visible el menú anterior
      // para que un problema de conexión no deje la página vacía.
      setProducts(
        fallbackProducts.map((product, index) => ({
          ...product,
          id: `fallback-${index}`,
        }))
      );

      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    let mounted = true;
    const now = new Date().toISOString();

    async function loadOffers() {
      try {
        const { data, error } = await supabase
          .from("promociones")
          .select("id, titulo, descripcion, tipo_descuento, valor_descuento, fecha_fin, aplica_todas_sucursales, sucursales_aplicables")
          .eq("activa", true)
          .lte("fecha_inicio", now)
          .gt("fecha_fin", now)
          .order("fecha_fin", { ascending: true });

        if (error) throw error;
        if (mounted) {
          setOffers(data || []);
          setOffersLoadError(false);
        }
      } catch (error) {
        console.error("Error cargando ofertas vigentes:", error);
        if (mounted) {
          setOffers([]);
          setOffersLoadError(true);
        }
      } finally {
        if (mounted) setOffersLoading(false);
      }
    }

    loadOffers();
    return () => {
      mounted = false;
    };
  }, []);

  // Categorías existentes más las que agregue el administrador.
  const categories = useMemo(() => {
    const databaseCategories = products
      .map((product) => product.category)
      .filter(Boolean);

    return [...new Set([...menuCategories, ...databaseCategories])];
  }, [products]);

  // Si la categoría seleccionada ya no tiene productos,
  // elegimos otra que sí tenga.
  useEffect(() => {
    if (products.length === 0) return;

    const activeHasProducts = products.some(
      (product) => product.category === active
    );

    if (!activeHasProducts) {
      const firstCategory = categories.find((category) =>
        products.some((product) => product.category === category)
      );

      if (firstCategory) {
        setActive(firstCategory);
      }
    }
  }, [products, categories, active]);

  const visibleProducts = products.filter(
    (product) => product.category === active
  );

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      {/* PRESENTACIÓN */}
      <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden px-6 pt-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e71921]/12 via-transparent to-[#080808]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="mb-5 inline-block text-sm font-black uppercase tracking-[0.35em] text-[#e71921]">
            Menú delivery / take away
          </span>

          <h1 className="text-5xl font-black uppercase leading-none sm:text-6xl md:text-8xl">
            Elegí tu pedido
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base font-bold leading-7 text-gray-300 sm:text-lg">
            Descubrí nuestros sabores, elegí tu plato favorito y
            preparate para disfrutar Jalu.
          </p>
        </div>
      </section>

      {/* OFERTAS VIGENTES */}
      <section
        id="ofertas"
        aria-labelledby="ofertas-title"
        className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mb-8 text-center">
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
            Elegí algo especial
          </span>
          <h2 id="ofertas-title" className="mt-3 text-3xl font-black uppercase sm:text-4xl md:text-5xl">
            Ofertas vigentes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-400">
            Aprovechá nuestras promociones mientras estén disponibles.
          </p>
        </div>

        {offersLoading ? (
          <p className="py-6 text-center text-sm font-bold text-gray-400" role="status">
            Buscando ofertas vigentes...
          </p>
        ) : offers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer) => {
              const discount = Number(offer.valor_descuento) || 0;
              const discountLabel = offer.tipo_descuento === "monto_fijo"
                ? `${new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 2,
                }).format(discount)} OFF`
                : `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(discount)}% OFF`;

              return (
                <article
                  key={offer.id}
                  className="flex min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-2xl border border-[#e71921]/30 bg-gradient-to-br from-[#251012] via-[#151010] to-[#101010] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.25)] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full border border-[#e71921]/30 bg-[#e71921]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#ff7378]">
                        Oferta por tiempo limitado
                      </span>
                      <h3 className="mt-4 break-words text-xl font-black uppercase text-white sm:text-2xl">
                        {offer.titulo}
                      </h3>
                    </div>
                    <strong className="shrink-0 rounded-xl bg-[#e71921] px-3 py-2 text-lg font-black text-white sm:text-xl">
                      {discountLabel}
                    </strong>
                  </div>

                  <p className="min-h-10 whitespace-pre-wrap break-words text-sm leading-6 text-gray-300">
                    {offer.descripcion || "Consultá por esta promoción al realizar tu pedido."}
                  </p>

                  <p className="text-xs font-bold text-gray-400">
                    Aplica en: {offer.aplica_todas_sucursales === false
                      ? (offer.sucursales_aplicables || []).join(", ")
                      : "todas las sucursales"}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <p className="text-xs font-bold text-gray-400">
                      Vigente hasta {new Intl.DateTimeFormat("es-AR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(offer.fecha_fin))}
                    </p>
                    <a
                      href="/pedidos"
                      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-4 text-xs font-black uppercase text-[#111] transition hover:bg-gray-200"
                    >
                      Hacer un pedido
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : offersLoadError ? (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-5 py-8 text-center text-sm font-bold text-amber-200" role="status">
            No pudimos cargar las ofertas en este momento.
          </p>
        ) : (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-8 text-center text-sm font-bold text-gray-400">
            En este momento no hay ofertas vigentes. Volvé pronto para conocer las próximas promociones.
          </p>
        )}
      </section>

      {/* PRODUCTOS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[#e71921]">
            Nuestros sabores
          </span>

          <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
            Nuestra carta
          </h2>

        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div
              className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#e71921]"
              role="status"
              aria-label="Cargando menú"
            />

            <p className="mt-4 text-sm font-bold text-gray-400">
              Preparando nuestra carta...
            </p>
          </div>
        ) : (
          <>
            {loadError && (
              <div
                role="alert"
                className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200"
              >
                No pudimos conectar con el menú actualizado. Estamos
                mostrando la carta anterior. Algunos precios o productos
                podrían no estar actualizados.
                <button
                  type="button"
                  onClick={loadProducts}
                  className="ml-2 font-black underline"
                >
                  Reintentar
                </button>
              </div>
            )}

            {products.length > 0 ? (
              <>
                {/* CATEGORÍAS */}
                <div
                  className="menu-tabs"
                  role="tablist"
                  aria-label="Categorías del menú"
                >
                  {categories
                    .filter((category) =>
                      products.some(
                        (product) => product.category === category
                      )
                    )
                    .map((category) => (
                      <button
                        className={`tab ${
                          active === category ? "active" : ""
                        }`}
                        key={category}
                        onClick={() => setActive(category)}
                        type="button"
                        role="tab"
                        aria-selected={active === category}
                      >
                        {category}
                      </button>
                    ))}
                </div>

                {/* TARJETAS */}
                {visibleProducts.length > 0 ? (
                  <div className="product-grid">
                    {visibleProducts.map((product) => (
                      <ProductCard
                        product={product}
                        key={product.id}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-gray-400">
                    No hay platos disponibles en esta categoría.
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                <p className="text-2xl font-black uppercase">
                  Estamos preparando la carta
                </p>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
                  Próximamente vas a encontrar nuestros platos disponibles
                  para pedir.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
      <WspFlotante />
    </main>
  );
}
