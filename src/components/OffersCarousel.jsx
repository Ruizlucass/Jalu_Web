import { useEffect, useState } from "react";

function formatDiscount(offer) {
  const value = Number(offer.valor_descuento) || 0;

  if (offer.tipo_descuento === "monto_fijo") {
    return `${new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value)} OFF`;
  }

  return `${new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(value)}% OFF`;
}

export default function OffersCarousel({ offers }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [offers.length]);

  useEffect(() => {
    if (offers.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex(
        (current) => (current + 1) % offers.length
      );
    }, 5500);

    return () => window.clearInterval(interval);
  }, [offers.length]);

  if (!offers.length) return null;

  const offer = offers[activeIndex];
  const hasImage = Boolean(offer.imagen_url);

  function previous() {
    setActiveIndex(
      (current) =>
        (current - 1 + offers.length) % offers.length
    );
  }

  function next() {
    setActiveIndex(
      (current) => (current + 1) % offers.length
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl">
      <article className="relative isolate min-h-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#151010] shadow-[0_24px_70px_rgba(0,0,0,0.45)] md:min-h-[410px]">
        {hasImage ? (
          <img
            key={offer.id}
            src={offer.imagen_url}
            alt={offer.titulo}
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#501014] via-[#1c1011] to-black" />
        )}

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/20 md:to-transparent" />

        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

        <div className="flex min-h-[360px] flex-col justify-center p-7 sm:p-10 md:min-h-[410px] md:max-w-[65%] md:p-14">
          <span className="mb-5 inline-flex w-fit rounded-full border border-[#ff555b]/50 bg-[#e71921]/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            Oferta por tiempo limitado
          </span>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h3 className="max-w-2xl break-words text-3xl font-black uppercase leading-[1.05] text-white sm:text-4xl md:text-5xl">
              {offer.titulo}
            </h3>

            <span className="rounded-xl bg-[#e71921] px-4 py-2 text-lg font-black text-white shadow-lg sm:text-xl">
              {formatDiscount(offer)}
            </span>
          </div>

          <p className="max-w-xl whitespace-pre-wrap break-words text-sm leading-6 text-gray-200 sm:text-base">
            {offer.descripcion ||
              "Consultá por esta promoción al realizar tu pedido."}
          </p>

          <p className="mt-4 text-xs font-bold text-gray-300">
            Aplica en:{" "}
            {offer.aplica_todas_sucursales === false
              ? (
                  offer.sucursales_aplicables || []
                ).join(", ")
              : "todas las sucursales"}
          </p>

          <div className="mt-7">
            <a
              href="/pedidos"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#e71921] px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-red-600"
            >
              Aprovechar oferta
              <span className="ml-2">→</span>
            </a>
          </div>
        </div>

        {offers.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Oferta anterior"
              className="absolute right-16 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/50 text-xl font-bold text-white backdrop-blur transition hover:bg-[#e71921]"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Oferta siguiente"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/50 text-xl font-bold text-white backdrop-blur transition hover:bg-[#e71921]"
            >
              ›
            </button>
          </>
        )}
      </article>

      {offers.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {offers.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver oferta ${index + 1}`}
              aria-current={
                index === activeIndex ? "true" : undefined
              }
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-8 bg-[#e71921]"
                  : "w-2.5 bg-white/25 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}