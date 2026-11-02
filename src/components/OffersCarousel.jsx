import { useEffect, useRef, useState } from "react";

export default function OffersCarousel({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageRatio, setImageRatio] = useState(16 / 9);
  const touchStartX = useRef(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [images.length]);

  if (!images.length) return null;

  function previous() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function next() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  const activeImage = images[activeIndex];

  return (
    <div
      className="relative isolate mx-auto w-full overflow-hidden rounded-2xl border border-white/10 bg-[#100d0d] shadow-[0_28px_80px_rgba(0,0,0,0.55)] sm:rounded-3xl"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Imágenes promocionales"
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (images.length < 2 || Math.abs(delta) <= 45) return;
        if (delta > 0) previous();
        else next();
      }}
    >
      <img
        key={`background-${activeImage.id}`}
        src={activeImage.imagen_url}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.46)_72%,rgba(0,0,0,0.76)_100%)]" />

      <div className="relative flex min-h-[220px] w-full items-center justify-center px-11 py-5 sm:min-h-[300px] sm:px-16 sm:py-6 lg:min-h-[340px]">
        <div
          className="relative max-h-[42vh] max-w-full overflow-hidden rounded-lg shadow-[0_20px_70px_rgba(0,0,0,0.5)] ring-1 ring-white/15 sm:rounded-xl"
          style={{
            width: `min(100%, ${imageRatio * 42}vh)`,
            aspectRatio: imageRatio,
          }}
        >
          <img
            key={activeImage.id}
            src={activeImage.imagen_url}
            alt={`Imagen promocional ${activeIndex + 1}`}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              if (naturalWidth && naturalHeight) {
                setImageRatio(naturalWidth / naturalHeight);
              }
            }}
            className="absolute inset-0 h-full w-full bg-black/20 object-contain"
          />
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/55 text-xl font-bold text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-[#ff4a50] hover:bg-[#e71921] sm:left-5 sm:h-12 sm:w-12 sm:text-2xl"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/55 text-xl font-bold text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-[#ff4a50] hover:bg-[#e71921] sm:right-5 sm:h-12 sm:w-12 sm:text-2xl"
          >
            ›
          </button>

          <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-2 sm:bottom-5">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver imagen ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-2 rounded-full shadow transition-all sm:h-2.5 ${
                  index === activeIndex
                    ? "w-8 bg-[#ff313a] shadow-[0_0_12px_rgba(231,25,33,0.8)] sm:w-10"
                    : "w-2 bg-white/45 hover:bg-white/80 sm:w-2.5"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
