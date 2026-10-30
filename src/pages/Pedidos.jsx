import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import ConfirmRequestModal from "../components/ConfirmRequestModal.jsx";
import { supabase } from "../supabase";

const ORDER_OBSERVATIONS = [
  "Sin cebolla",
  "Sin salsa",
  "Sin picante",
  "Agregar cubiertos",
  "Tocar timbre",
  "Llamar al llegar",
];

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function Pedidos() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuProducts, setMenuProducts] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = window.sessionStorage.getItem("jalu_pedido_cart");
      return savedCart ? JSON.parse(savedCart) : {};
    } catch {
      return {};
    }
  });
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [observations, setObservations] = useState([]);
  const [observationsText, setObservationsText] = useState("");

  const [form, setForm] = useState(() => {
    const initialForm = {
      nombre: "",
      telefono: "",
      sucursal: "",
      tipo_entrega: "retiro",
      direccion: "",
      medio_pago: "efectivo",
    };

    try {
      const savedForm = window.sessionStorage.getItem("jalu_pedido_form");
      return savedForm ? { ...initialForm, ...JSON.parse(savedForm) } : initialForm;
    } catch {
      return initialForm;
    }
  });

  useEffect(() => {
    cargarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nuevaSession) => {
        setSession(nuevaSession);
      }
    );

    cargarProductos();
    cargarOfertas();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem("jalu_pedido_cart", JSON.stringify(cart));
    } catch (storageError) {
      console.error("No se pudo guardar el carrito del pedido:", storageError);
    }
  }, [cart]);

  // Conserva los datos personales al salir al catálogo y volver a Pedidos.
  useEffect(() => {
    try {
      window.sessionStorage.setItem("jalu_pedido_form", JSON.stringify(form));
    } catch (storageError) {
      console.error("No se pudieron guardar los datos del pedido:", storageError);
    }
  }, [form]);

  async function cargarProductos() {
    setMenuLoading(true);
    setMenuError("");
    try {
      const { data, error: productsError } = await supabase
        .from("menu_productos")
        .select("id, nombre, descripcion, precio, categoria, disponible")
        .eq("disponible", true)
        .order("categoria", { ascending: true })
        .order("nombre", { ascending: true });

      if (productsError) throw productsError;
      setMenuProducts(data || []);
    } catch (productsError) {
      console.error("Error cargando productos para el pedido:", productsError);
      setMenuError("No pudimos cargar el menú. Actualizá la página o intentá nuevamente.");
      setMenuProducts([]);
    } finally {
      setMenuLoading(false);
    }
  }

  async function cargarOfertas() {
    setOffersLoading(true);
    const now = new Date().toISOString();
    try {
      const { data, error: offersQueryError } = await supabase
        .from("promociones")
        .select("id, titulo, descripcion, tipo_descuento, valor_descuento, aplica_todas_sucursales, sucursales_aplicables")
        .eq("activa", true)
        .lte("fecha_inicio", now)
        .gt("fecha_fin", now)
        .order("fecha_fin", { ascending: true });

      if (offersQueryError) throw offersQueryError;
      setOffers(data || []);
      setOffersError(false);
    } catch (offersQueryError) {
      console.error("Error cargando ofertas para el pedido:", offersQueryError);
      setOffers([]);
      setOffersError(true);
    } finally {
      setOffersLoading(false);
    }
  }

  async function cargarSesion() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);
    setLoadingSession(false);
  }

  const cartItems = menuProducts
    .filter((product) => Number(cart[product.id]) > 0)
    .map((product) => ({
      ...product,
      cantidad: Number(cart[product.id]),
      importe: Number(product.precio) * Number(cart[product.id]),
    }));
  const subtotal = cartItems.reduce((sum, item) => sum + item.importe, 0);
  const selectedBranch = form.sucursal === "Otra"
    ? "Otra sucursal"
    : form.sucursal;
  const applicableOffers = form.sucursal
    ? offers.filter((offer) =>
        offer.aplica_todas_sucursales !== false ||
        (offer.sucursales_aplicables || []).includes(selectedBranch)
      )
    : [];
  const selectedOffer = applicableOffers.find(
    (offer) => String(offer.id) === String(selectedOfferId)
  );
  const offerDiscount = selectedOffer
    ? selectedOffer.tipo_descuento === "monto_fijo"
      ? Math.min(subtotal, Number(selectedOffer.valor_descuento) || 0)
      : subtotal * (Number(selectedOffer.valor_descuento) || 0) / 100
    : 0;
  const total = Math.max(0, subtotal - offerDiscount);
  const orderDescription = [
    ...cartItems.map((item) => `${item.cantidad} x ${item.nombre} — ${formatMoney(item.precio)} c/u`),
    selectedOffer ? `Oferta aplicada: ${selectedOffer.titulo} (-${formatMoney(offerDiscount)})` : "",
    `Subtotal: ${formatMoney(subtotal)}`,
    offerDiscount > 0 ? `Descuento: -${formatMoney(offerDiscount)}` : "",
    `Total: ${formatMoney(total)}`,
  ].filter(Boolean).join("\n");
  const quickObservations = observations.join(", ");
  const customObservationLimit = Math.max(
    0,
    200 - quickObservations.length - (quickObservations ? 2 : 0)
  );
  const observationsValue = [quickObservations, observationsText.trim()]
    .filter(Boolean)
    .join(", ")
    .slice(0, 200);

  function handleChange(e) {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "nombre") {
      value = value
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ' -]/g, "")
        .replace(/\s{2,}/g, " ")
        .slice(0, 20);
    }

    if (name === "telefono") {
      // Solo números: ejemplo válido 3816135274.
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((actual) => ({
      ...actual,
      [name]: value,
    }));

    setError("");
    setMensaje("");
    if (name === "sucursal") setSelectedOfferId("");
  }

  function actualizarCantidad(productId, difference) {
    setCart((current) => {
      const nextQuantity = Math.max(0, Number(current[productId] || 0) + difference);
      if (nextQuantity === 0) {
        const nextCart = { ...current };
        delete nextCart[productId];
        return nextCart;
      }
      return { ...current, [productId]: nextQuantity };
    });
    setError("");
  }

  function toggleObservation(observation) {
    const nextObservations = observations.includes(observation)
      ? observations.filter((item) => item !== observation)
      : observations.length < 3 && [...observations, observation].join(", ").length <= 200
        ? [...observations, observation]
        : observations;
    const nextQuickObservations = nextObservations.join(", ");
    const nextTextLimit = Math.max(
      0,
      200 - nextQuickObservations.length - (nextQuickObservations ? 2 : 0)
    );
    setObservations(nextObservations);
    setObservationsText((current) => current.slice(0, nextTextLimit));
    setError("");
  }

  function abrirLogin() {
    setAuthMode("login");
    setAuthOpen(true);
  }

  function guardarPedido(e) {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!session?.user) {
      abrirLogin();
      return;
    }

    const nombreCompleto = form.nombre.trim();
    const partesNombre = nombreCompleto.split(/\s+/).filter(Boolean);
    const telefonoNumeros = form.telefono.replace(/\D/g, "");

    if (!nombreCompleto || !form.telefono.trim() || !form.sucursal) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    if (
      partesNombre.length < 2 ||
      nombreCompleto.length > 20 ||
      partesNombre.some((parte) => parte.length < 2)
    ) {
      setError("Ingresá nombre y apellido. El máximo permitido es de 20 caracteres en total.");
      return;
    }

    if (telefonoNumeros.length !== 10) {
      setError("Ingresá un teléfono válido de 10 dígitos. Ejemplo: 3816135274.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Agregá al menos un producto del menú al pedido.");
      return;
    }

    if (
      form.tipo_entrega === "delivery" &&
      !form.direccion.trim()
    ) {
      setError(
        "Ingresá la dirección para realizar el delivery."
      );
      return;
    }

    setConfirmOpen(true);
  }

  async function confirmarPedido() {
    if (!session?.user || enviando) {
      return;
    }

    setEnviando(true);
    setError("");
    setMensaje("");

    try {
      const { error: supabaseError } =
        await supabase
          .from("pedidos")
          .insert({
            user_id: session.user.id,

            nombre: form.nombre.trim(),
            email: session.user.email,
            telefono: form.telefono.trim(),

            sucursal: form.sucursal,

            tipo_entrega:
              form.tipo_entrega,

            direccion:
              form.tipo_entrega ===
              "delivery"
                ? form.direccion.trim()
                : null,

            descripcion: orderDescription,

            observaciones: observationsValue || null,

            total,
            medio_pago: form.medio_pago,
            pago_efectivo: 0,
            pago_transferencia: 0,

            estado: "pendiente",
          });

      if (supabaseError) {
        console.error("Error registrando pedido:", supabaseError);

        // Cerramos el modal para que el usuario pueda ver el error.
        setConfirmOpen(false);
        setError(
          `No pudimos registrar el pedido: ${supabaseError.message || "error desconocido"}`
        );

        return;
      }

      setConfirmOpen(false);

      setMensaje(
        "¡Pedido registrado! Quedó pendiente de confirmación. Tenés 5 minutos para cancelarlo desde Mis solicitudes."
      );

      const emptyForm = {
        nombre: "",
        telefono: "",
        sucursal: "",
        tipo_entrega: "retiro",
        direccion: "",
        medio_pago: "efectivo",
      };
      setForm(emptyForm);
      setCart({});
      try {
        window.sessionStorage.removeItem("jalu_pedido_cart");
        window.sessionStorage.removeItem("jalu_pedido_form");
      } catch {}
      setSelectedOfferId("");
      setObservations([]);
      setObservationsText("");
    } catch (unexpectedError) {
      console.error(
        "Error inesperado registrando pedido:",
        unexpectedError
      );

      setConfirmOpen(false);
      setError(
        `Ocurrió un error inesperado: ${unexpectedError?.message || "intentá nuevamente"}`
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090909] text-white">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e71921]/20 via-transparent to-transparent" />

          <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-40 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-36">
            <span className="text-sm font-bold uppercase tracking-[0.35em] text-[#e71921]">
              Jalu Comidas Árabes
            </span>

            <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Pedí Jalu
              <span className="text-[#e71921]">
                .
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Elegí cómo querés recibir tu pedido y
              disfrutá Jalu donde quieras.
            </p>
          </div>
        </section>

        {/* OPCIONES */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#e71921]">
              Elegí tu forma de pedir
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Fácil, rápido y rico.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7 transition hover:-translate-y-1 hover:border-[#e71921]/40">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e71921] text-2xl">
                🛍️
              </div>

              <h3 className="text-2xl font-black">
                Take Away
              </h3>

              <p className="mt-3 text-gray-400">
                Hacé tu pedido y retiralo directamente
                por la sucursal seleccionada.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7 transition hover:-translate-y-1 hover:border-[#e71921]/40">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e71921] text-2xl">
                🛵
              </div>

              <h3 className="text-2xl font-black">
                Delivery
              </h3>

              <p className="mt-3 text-gray-400">
                Elegí delivery y recibí tu pedido
                directamente en tu domicilio.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7 transition hover:-translate-y-1 hover:border-[#e71921]/40">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e71921] text-2xl">
                🍽️
              </div>

              <h3 className="text-2xl font-black">
                Mirá el menú
              </h3>

              <p className="mt-3 text-gray-400">
                Consultá nuestros platos antes de
                realizar tu pedido.
              </p>

              <a
                href="/menu?modo=pedido"
                className="mt-5 inline-block font-bold text-[#e71921] transition hover:text-red-400"
              >
                Ver menú →
              </a>
            </div>
          </div>
        </section>

        {/* PEDIDO */}
        <section className="border-t border-white/10 bg-[#0c0c0c]">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24">
            {/* INFORMACIÓN */}
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#e71921]">
                Pedido online
              </p>

              <h2 className="mt-3 text-4xl font-black">
                Pedir nunca fue
                <br />
                tan simple.
              </h2>

              <p className="mt-5 max-w-md text-gray-400">
                Iniciá sesión, elegí la sucursal y
                cómo querés recibir tu pedido.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  ["01", "Iniciá sesión"],
                  ["02", "Elegí una sucursal"],
                  ["03", "Elegí los platos del menú"],
                  ["04", "Aplicá una oferta y confirmá"],
                ].map(([numero, texto]) => (
                  <div
                    key={numero}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e71921] font-black">
                      {numero}
                    </span>

                    <span className="font-semibold">
                      {texto}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* FORMULARIO */}
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-sm font-bold text-[#e71921]">
                  NUEVO PEDIDO
                </p>

                <h3 className="mt-2 text-3xl font-black">
                  Datos de tu pedido
                </h3>
              </div>

              {!loadingSession && !session && (
                <div className="mb-6 rounded-xl border border-[#e71921]/30 bg-[#e71921]/10 p-4">
                  <p className="font-semibold">
                    Necesitás iniciar sesión para
                    realizar un pedido.
                  </p>

                  <button
                    onClick={abrirLogin}
                    type="button"
                    className="mt-3 text-sm font-bold text-[#e71921] transition hover:text-red-400"
                  >
                    Iniciar sesión →
                  </button>
                </div>
              )}

              <form
                onSubmit={guardarPedido}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Nombre y apellido
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre y apellido"
                    maxLength={20}
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 outline-none transition focus:border-[#e71921]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Teléfono
                  </label>

                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="3816135274"
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    autoComplete="tel"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 outline-none transition focus:border-[#e71921]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Sucursal
                  </label>

                  <select
                    name="sucursal"
                    value={form.sucursal}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 outline-none transition focus:border-[#e71921]"
                  >
                    <option value="">
                      Seleccionar sucursal
                    </option>

                    <option value="Yerba Buena">
                      Yerba Buena
                    </option>

                    <option value="Centro">
                      Centro
                    </option>

                    <option value="Otra">
                      Otra sucursal
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-300">
                    ¿Cómo querés recibirlo?
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((actual) => ({
                          ...actual,
                          tipo_entrega: "retiro",
                        }))
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        form.tipo_entrega === "retiro"
                          ? "border-[#e71921] bg-[#e71921]/10"
                          : "border-white/10 bg-[#090909] hover:border-white/20"
                      }`}
                    >
                      <span className="block text-xl">
                        🛍️
                      </span>

                      <span className="mt-2 block font-bold">
                        Take Away
                      </span>

                      <span className="mt-1 block text-xs text-gray-500">
                        Retirar en sucursal
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((actual) => ({
                          ...actual,
                          tipo_entrega: "delivery",
                        }))
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        form.tipo_entrega === "delivery"
                          ? "border-[#e71921] bg-[#e71921]/10"
                          : "border-white/10 bg-[#090909] hover:border-white/20"
                      }`}
                    >
                      <span className="block text-xl">
                        🛵
                      </span>

                      <span className="mt-2 block font-bold">
                        Delivery
                      </span>

                      <span className="mt-1 block text-xs text-gray-500">
                        Recibir en domicilio
                      </span>
                    </button>
                  </div>
                </div>

                {form.tipo_entrega === "delivery" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Dirección
                    </label>

                    <input
                      type="text"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      placeholder="Calle, número, barrio..."
                      className="w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 outline-none transition focus:border-[#e71921]"
                    />
                  </div>
                )}

                <section className="space-y-3 rounded-2xl border border-white/10 bg-[#090909] p-4 sm:p-5">
                  <p className="text-sm font-semibold text-gray-200">¿Cómo querés pagar? *</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((actual) => ({ ...actual, medio_pago: "efectivo" }))}
                      className={`rounded-xl border p-4 text-left transition ${form.medio_pago === "efectivo" ? "border-[#e71921] bg-[#e71921]/10" : "border-white/10 bg-[#090909] hover:border-white/20"}`}
                    >
                      <span className="block text-xl">💵</span>
                      <span className="mt-2 block font-bold">Efectivo</span>
                      <span className="mt-1 block text-xs text-gray-500">Pagás en efectivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((actual) => ({ ...actual, medio_pago: "transferencia" }))}
                      className={`rounded-xl border p-4 text-left transition ${form.medio_pago === "transferencia" ? "border-[#e71921] bg-[#e71921]/10" : "border-white/10 bg-[#090909] hover:border-white/20"}`}
                    >
                      <span className="block text-xl">📲</span>
                      <span className="mt-2 block font-bold">Transferencia</span>
                      <span className="mt-1 block text-xs text-gray-500">Transferís al confirmar</span>
                    </button>
                  </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-white/10 bg-[#090909] p-4 sm:p-5">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-200">
                        Elegí tus platos *
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Productos disponibles publicados en el menú.
                      </p>
                    </div>
                    <a href="/menu?modo=pedido" className="text-xs font-bold text-[#ff5b62] hover:text-white">
                      Ver menú completo
                    </a>
                  </div>

                  {menuLoading ? (
                    <p className="py-6 text-center text-sm text-gray-400" role="status">
                      Cargando menú...
                    </p>
                  ) : menuError ? (
                    <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                      {menuError}
                      <button type="button" onClick={cargarProductos} className="ml-2 font-black underline">
                        Reintentar
                      </button>
                    </div>
                  ) : menuProducts.length === 0 ? (
                    <p className="rounded-xl border border-white/10 p-4 text-sm text-gray-400">
                      No hay platos disponibles en este momento.
                    </p>
                  ) : (
                    <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
                      {menuProducts.map((product) => {
                        const quantity = Number(cart[product.id] || 0);
                        return (
                          <article key={product.id} className="grid min-w-0 gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                            <div className="min-w-0">
                              <p className="break-words text-sm font-black text-white">
                                {product.nombre}
                              </p>
                              <p className="mt-1 text-xs font-bold text-gray-500">
                                {product.categoria} · {formatMoney(product.precio)}
                              </p>
                              {product.descripcion && (
                                <p className="mt-1 break-words text-xs leading-5 text-gray-400">
                                  {product.descripcion}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 sm:justify-self-end">
                              {quantity > 0 && (
                                <>
                                  <button
                                    type="button"
                                    aria-label={`Quitar una unidad de ${product.nombre}`}
                                    onClick={() => actualizarCantidad(product.id, -1)}
                                    className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-lg font-black text-white hover:border-[#e71921]"
                                  >
                                    −
                                  </button>
                                  <span className="min-w-6 text-center text-sm font-black">{quantity}</span>
                                </>
                              )}
                              <button
                                type="button"
                                aria-label={quantity ? `Agregar otra unidad de ${product.nombre}` : `Agregar ${product.nombre}`}
                                onClick={() => actualizarCantidad(product.id, 1)}
                                className="min-h-9 rounded-full bg-[#e71921] px-4 text-xs font-black uppercase text-white transition hover:bg-[#ff3038]"
                              >
                                {quantity > 0 ? "Agregar +" : "Agregar"}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}

                  {cartItems.length > 0 && (
                    <div className="space-y-2 border-t border-white/10 pt-4">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                        Tu pedido ({cartItems.reduce((sum, item) => sum + item.cantidad, 0)} productos)
                      </p>
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between gap-3 text-sm">
                          <span className="min-w-0 break-words text-gray-300">{item.cantidad} × {item.nombre}</span>
                          <span className="shrink-0 font-bold text-white">{formatMoney(item.importe)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-white/10 pt-3 text-sm font-black">
                        <span>Subtotal</span>
                        <span>{formatMoney(subtotal)}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <p className="text-sm font-semibold text-gray-200">Ofertas vigentes</p>
                    {!form.sucursal ? (
                      <p className="text-xs text-gray-500">Elegí una sucursal para ver las ofertas aplicables.</p>
                    ) : offersLoading ? (
                      <p className="text-xs text-gray-500">Buscando ofertas...</p>
                    ) : offersError ? (
                      <p className="text-xs text-amber-300">No pudimos cargar las ofertas. Podés continuar con el pedido sin aplicar una promoción.</p>
                    ) : applicableOffers.length === 0 ? (
                      <p className="text-xs text-gray-500">No hay ofertas vigentes para esta sucursal.</p>
                    ) : (
                      <div className="grid gap-2">
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-sm">
                          <input
                            type="radio"
                            name="pedido-oferta"
                            checked={!selectedOfferId}
                            onChange={() => setSelectedOfferId("")}
                            className="mt-1 accent-[#e71921]"
                          />
                          <span>Sin oferta</span>
                        </label>
                        {applicableOffers.map((offer) => (
                          <label key={offer.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                            String(selectedOfferId) === String(offer.id)
                              ? "border-[#e71921]/60 bg-[#e71921]/10"
                              : "border-white/10 bg-white/[0.025] hover:border-white/20"
                          }`}>
                            <input
                              type="radio"
                              name="pedido-oferta"
                              checked={String(selectedOfferId) === String(offer.id)}
                              onChange={() => setSelectedOfferId(String(offer.id))}
                              className="mt-1 accent-[#e71921]"
                            />
                            <span className="min-w-0">
                              <span className="block font-black text-white">
                                {offer.titulo} · {offer.tipo_descuento === "monto_fijo"
                                  ? formatMoney(offer.valor_descuento)
                                  : `${Number(offer.valor_descuento)}%`} de descuento
                              </span>
                              {offer.descripcion && <span className="mt-1 block text-xs leading-5 text-gray-400">{offer.descripcion}</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="flex justify-between rounded-xl border border-[#e71921]/30 bg-[#e71921]/10 p-4 text-base font-black">
                      <span>Total</span>
                      <span>{formatMoney(total)}</span>
                    </div>
                  )}
                </section>

                <fieldset className="space-y-3">
                  <legend className="mb-2 text-sm font-semibold text-gray-200">
                    Observaciones (opcional, máximo 200 caracteres)
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ORDER_OBSERVATIONS.map((observation) => {
                      const checked = observations.includes(observation);
                      const limitReached = observations.length >= 3 && !checked;
                      return (
                        <label key={observation} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                          checked
                            ? "border-[#e71921]/50 bg-[#e71921]/10 text-white"
                            : "border-white/10 bg-[#090909] text-gray-300 hover:border-white/20"
                        } ${limitReached ? "cursor-not-allowed opacity-50" : ""}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={limitReached}
                            onChange={() => toggleObservation(observation)}
                            className="h-4 w-4 accent-[#e71921]"
                          />
                          {observation}
                        </label>
                      );
                    })}
                  </div>
                  <div>
                    <label htmlFor="pedido-observaciones" className="mb-2 block text-sm font-semibold text-gray-300">
                      ¿Querés agregar un detalle específico?
                    </label>
                    <textarea
                      id="pedido-observaciones"
                      name="observaciones"
                      rows={3}
                      maxLength={customObservationLimit}
                      value={observationsText}
                      onChange={(event) => setObservationsText(event.target.value.slice(0, customObservationLimit))}
                      placeholder="Ej.: la salsa aparte, cortar el shawarma por la mitad..."
                      className="w-full resize-y rounded-xl border border-white/10 bg-[#090909] px-4 py-3 outline-none transition placeholder:text-gray-600 focus:border-[#e71921]"
                    />
                    <p className="mt-1 text-right text-xs text-gray-500" aria-live="polite">
                      {Math.min(200, quickObservations.length + (quickObservations ? 2 : 0) + observationsText.length)}/200
                    </p>
                  </div>
                </fieldset>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {mensaje && (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                    <p>{mensaje}</p>

                    <a
                      href="/mis-solicitudes"
                      className="mt-3 inline-block font-black text-green-200 underline underline-offset-4"
                    >
                      Ver mis solicitudes →
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full rounded-xl bg-[#e71921] px-6 py-4 font-black text-white transition hover:bg-[#ff252d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enviando
                    ? "Registrando pedido..."
                    : "Confirmar pedido"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* CANALES */}
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#e71921]">
              También podés pedir
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Elegí tu canal favorito
            </h2>

            <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                <p className="text-2xl">
                  💬
                </p>
                <p className="mt-2 font-bold">
                  WhatsApp
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                <p className="text-2xl">
                  🛵
                </p>
                <p className="mt-2 font-bold">
                  PedidosYa
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
                <p className="text-2xl">
                  🥡
                </p>
                <p className="mt-2 font-bold">
                  Rappi
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ConfirmRequestModal
        open={confirmOpen}
        title="Confirmar pedido"
        description="Revisá los datos antes de enviarlos a Jalu."
        confirmLabel="Sí, confirmar pedido"
        loading={enviando}
        onCancel={() =>
          setConfirmOpen(false)
        }
        onConfirm={confirmarPedido}
        fields={[
          {
            label: "Nombre",
            value: form.nombre,
          },
          {
            label: "Teléfono",
            value: form.telefono,
          },
          {
            label: "Sucursal",
            value: form.sucursal,
          },
          {
            label: "Medio de pago",
            value: form.medio_pago === "transferencia" ? "Transferencia" : "Efectivo",
          },
          {
            label: "Entrega",
            value:
              form.tipo_entrega === "delivery"
                ? "Delivery"
                : "Take Away",
          },
          {
            label: "Dirección",
            value:
              form.tipo_entrega === "delivery"
                ? form.direccion
                : "Retira en sucursal",
          },
          {
            label: "Pedido",
            value: orderDescription,
          },
          {
            label: "Observaciones",
            value: observationsValue || "Sin observaciones",
          },
          {
            label: "Total",
            value: formatMoney(total),
          },
        ]}
      />

      <AuthModal
        open={authOpen}
        mode={authMode}
        setMode={setAuthMode}
        onClose={() =>
          setAuthOpen(false)
        }
        onSuccess={() => {
          setAuthOpen(false);
          cargarSesion();
        }}
      />
    </>
  );
}