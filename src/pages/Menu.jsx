import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { ProductCard } from "../components/Cards.jsx";
import Footer from "../components/Footer.jsx";
import WspFlotante from "../components/WspFlotante.jsx";
import { menuCategories, products as fallbackProducts } from "../utils/siteData.js";
import { supabase } from "../supabase.js";
import OffersCarousel from "../components/OffersCarousel.jsx";

export default function Menu() {
  const [active, setActive] = useState("Combos");
  const [products, setProducts] = useState([]);

  // Recupera el carrito guardado al volver desde Pedidos.
  const [orderCart, setOrderCart] = useState(() => {
    try {
      const saved = window.sessionStorage.getItem("jalu_pedido_cart");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bannerImages, setBannerImages] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Cargar productos disponibles desde Supabase.
  const loadProducts = useCallback(async () => {
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

      if (error) throw error;

      const formattedProducts = (data || []).map((product) => ({
        id: product.id,
        name: product.nombre,
        desc: product.descripcion || "",
        price: new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
          maximumFractionDigits: 2,
        }).format(Number(product.precio) || 0),
        rawPrice: Number(product.precio) || 0,
        image: product.imagen_url || "",
        category:
          product.categoria === "Dulces arabes" ? "Entradas" : product.categoria,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error cargando el menú de Supabase:", error);

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

  // Cargar imágenes del carrusel.
  useEffect(() => {
    let mounted = true;

    async function loadBannerImages() {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("banners_menu")
          .select("id, imagen_url")
          .lte("fecha_inicio", now)
          .gt("fecha_limite", now)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error cargando ofertas nuevas; se consultan las anteriores:", error);
          const { data: legacyOffers, error: legacyError } = await supabase
            .from("promociones")
            .select("id, imagen_url")
            .eq("activa", true)
            .lte("fecha_inicio", now)
            .gt("fecha_fin", now)
            .not("imagen_url", "is", null);

          if (legacyError) throw legacyError;
          if (mounted) setBannerImages(legacyOffers || []);
          return;
        }

        if (mounted) setBannerImages(data || []);
      } catch (error) {
        console.error("Error cargando ofertas:", error);

        if (mounted) setBannerImages([]);
      } finally {
        if (mounted) setBannersLoading(false);
      }
    }

    loadBannerImages();

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

  // Seleccionar automáticamente una categoría que tenga productos.
  useEffect(() => {
    if (products.length === 0) return;

    const activeHasProducts = products.some(
      (product) => product.category === active
    );

    if (!activeHasProducts) {
      const firstCategory = categories.find((category) =>
        products.some((product) => product.category === category)
      );

      if (firstCategory) setActive(firstCategory);
    }
  }, [products, categories, active]);

  const visibleProducts = products.filter(
    (product) => product.category === active
  );

  const selectedCount = Object.values(orderCart).reduce(
    (sum, quantity) => sum + (Number(quantity) || 0),
    0
  );

  // Agregar o quitar cantidades del carrito.
  function changeOrderQuantity(productId, amount) {
    setOrderCart((current) => {
      const next = { ...current };

      const quantity = Math.max(
        0,
        Number(next[productId] || 0) + amount
      );

      if (quantity === 0) {
        delete next[productId];
      } else {
        next[productId] = quantity;
      }

      try {
        window.sessionStorage.setItem(
          "jalu_pedido_cart",
          JSON.stringify(next)
        );
      } catch (error) {
        console.error("No se pudo guardar la selección del menú:", error);
      }

      return next;
    });
  }

  // Guardar y regresar a la página de Pedidos.
  function volverAlPedido() {
    try {
      window.sessionStorage.setItem(
        "jalu_pedido_cart",
        JSON.stringify(orderCart)
      );
    } catch (error) {
      console.error("No se pudo guardar la selección del menú:", error);
    }

    window.location.href = "/pedidos";
  }

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

      <section
        id="ofertas"
        aria-labelledby="menu-offers-title"
        className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-9"
      >
        <div className="mb-4 text-center sm:mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff555b] sm:text-xs">
            Para disfrutar
          </p>
          <h2
            id="menu-offers-title"
            className="mt-1 text-2xl font-black uppercase leading-none tracking-tight text-white sm:text-3xl"
          >
            Ofertas
          </h2>
          <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-[#e71921] shadow-[0_0_14px_rgba(231,25,33,0.6)]" />
        </div>
        {bannersLoading ? (
          <div className="grid min-h-32 place-items-center rounded-2xl border border-white/10 bg-[#100d0d] text-sm font-bold text-gray-500">
            Cargando ofertas...
          </div>
        ) : bannerImages.length > 0 ? (
          <OffersCarousel images={bannerImages} />
        ) : (
          <div className="grid min-h-32 place-items-center rounded-2xl border border-white/10 bg-[#100d0d] px-5 text-center text-sm font-bold text-gray-500">
            No hay ofertas activas en este momento.
          </div>
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

                {/* TARJETAS DE PRODUCTOS */}
                {visibleProducts.length > 0 ? (
                  <div className="product-grid">
                    {visibleProducts.map((product) => {
                      const quantity = Number(orderCart[product.id] || 0);

                      const canOrder = !String(product.id).startsWith(
                        "fallback-"
                      );

                      return (
                        <div
                          key={product.id}
                          className="flex min-w-0 flex-col gap-3"
                        >
                          <ProductCard
                            product={product}
                            showOrderButton={false}
                          />

                          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            {quantity > 0 ? (
                              <>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      changeOrderQuantity(product.id, -1)
                                    }
                                    aria-label={`Quitar una unidad de ${product.name}`}
                                    className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-lg font-black hover:border-[#e71921]"
                                  >
                                    −
                                  </button>

                                  <span className="min-w-5 text-center font-black">
                                    {quantity}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    changeOrderQuantity(product.id, 1)
                                  }
                                  className="rounded-full bg-[#e71921] px-4 py-2 text-xs font-black uppercase text-white hover:bg-red-600"
                                >
                                  Agregar otro
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">
                                {product.price}
                              </span>
                            )}

                            {!canOrder ? (
                              <span className="text-xs font-bold text-amber-300">
                                No disponible para pedidos
                              </span>
                            ) : quantity === 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  changeOrderQuantity(product.id, 1)
                                }
                                className="rounded-full bg-[#e71921] px-4 py-2 text-xs font-black uppercase text-white hover:bg-red-600"
                              >
                                Agregar al pedido
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
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

        {/* RESUMEN DE SELECCIÓN */}
        {selectedCount > 0 && (
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e71921]/40 bg-[#e71921]/10 p-5 sm:flex-row">
            <div>
              <p className="text-lg font-black text-white">
                Tu selección: {selectedCount}{" "}
                {selectedCount === 1 ? "producto" : "productos"}
              </p>

              <p className="mt-1 text-sm text-gray-300">
                Al continuar, volvés a Pedidos con los productos y
                cantidades seleccionados.
              </p>
            </div>

            <button
              type="button"
              onClick={volverAlPedido}
              className="min-h-12 rounded-xl bg-[#e71921] px-6 py-3 text-sm font-black uppercase text-white transition hover:bg-red-600"
            >
              Agregar selección al pedido →
            </button>
          </div>
        )}
      </section>

      <Footer />
      <WspFlotante />
    </main>
  );
}
