import { useEffect, useState } from "react";
import Button from "./Button.jsx";
import { trackEvent } from "../helpers/tracking.js";

export default function Hero() {
  const images = [
    "img/Carrousel1.jpg",
    "img/Carrousel2.jpg",
    "img/Carrousel3.jpg",
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section id="home" className="hero">
      {/* Carousel Background */}
      <div className="hero-carousel">
        {images.map((image, index) => (
          <div
            key={index}
            className={`hero-slide ${index === current ? "active" : ""}`}
            style={{
              backgroundImage: `url(${image})`,
            }}
          />
        ))}
      </div>

      {/* Overlay */}
      <div className="hero-overlay" />

      {/* Content */}
      <div className="hero-inner">
        <span className="eyebrow">Fast food árabe moderno</span>

        <h1>El verdadero sabor árabe, como querés comerlo</h1>

        <p className="hero-copy">
          Delivery, take away y salón con árabe libre. Oscuro, urbano y fuerte:
          comida árabe pensada para vender todos los días.
        </p>

        <div className="hero-actions">
          <Button
            href="#pedidos"
            onClick={() => trackEvent("click_pedir_hero")}
          >
            Pedir ahora
          </Button>

          <Button
            variant="dark"
            href="#reservas"
            onClick={() => trackEvent("click_reservar_hero")}
          >
            Reservar mesa
          </Button>
        </div>

        <div className="hero-statbar" aria-label="Datos destacados">
          <div className="hero-stat">
            <strong>6</strong>
            <span>Sucursales</span>
          </div>

          <div className="hero-stat">
            <strong>Libre</strong>
            <span>Salón</span>
          </div>

          <div className="hero-stat">
            <strong>Rápido</strong>
            <span>Delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
}