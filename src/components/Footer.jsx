export default function Footer() {
  return (
    <footer className="footer">
      <a className="flex items-center" href="#home" aria-label="Jalu inicio">
        <img className="block h-auto w-[118px]" src="/img/jalu-logo.svg" alt="Jalu" />
      </a>
      <p>Comidas árabes con identidad urbana. Tucumán.</p>
      <p>Meta Pixel y Google Analytics se agregan en producción con eventos: click_pedir, click_reservar y seleccion_sucursal.</p>
    </footer>
  );
}
