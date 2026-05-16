import {
  FaInstagram,
  FaWhatsapp,
  FaFacebook,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-[#080808] text-white mt-20 border-t border-white/10">

      {/* Parte superior */}
      <div className="w-full px-20 py-16 grid grid-cols-1 md:grid-cols-4 items-start gap-16">

        {/* Logo */}
        <div className="flex items-start">
          <a href="#home" aria-label="Jalu inicio">
            <img
              src="public/img/Logo-Jalu.png"
              alt="Jalu"
              className="h-28 w-auto hover:scale-105 transition duration-300"
            />
          </a>
        </div>

        {/* Sobre Nosotros */}
        <div>
          <h3 className="font-bold text-2xl mb-6">
            Sobre Nosotros
          </h3>

          <ul className="space-y-4 text-base text-[#b9b9b9]">
            <li className="hover:text-[#e71921] cursor-pointer transition">
              Nuestra historia
            </li>

            <li className="hover:text-[#e71921] cursor-pointer transition">
              Quiénes Somos
            </li>

            <li className="hover:text-[#e71921] cursor-pointer transition">
              Reservas
            </li>

            <li className="hover:text-[#e71921] cursor-pointer transition">
              Contacto
            </li>
          </ul>
        </div>

        {/* Descubrí */}
        <div>
          <h3 className="font-bold text-2xl mb-6">
            Descubrí
          </h3>

          <ul className="space-y-4 text-base text-[#b9b9b9]">
            <li>
              <a className="hover:text-[#e71921] cursor-pointer transition" href="/menu">
                Menú
              </a>
            </li>

            <li className="hover:text-[#e71921] cursor-pointer transition">
              Promociones
            </li>

            <li className="hover:text-[#e71921] cursor-pointer transition">
              Eventos
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="font-bold text-2xl mb-6">
            Contacto
          </h3>

          <p className="text-[#b9b9b9] mb-5 leading-relaxed">
            Seguinos en nuestras redes sociales
          </p>

          {/* Redes */}
          <div className="flex gap-5 text-3xl">

            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b9b9b9] hover:text-[#e71921] hover:scale-110 transition duration-300"
            >
              <FaFacebook />
            </a>

            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b9b9b9] hover:text-[#e71921] hover:scale-110 transition duration-300"
            >
              <FaInstagram />
            </a>

            <a
              href="https://wa.me/5493811234567"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b9b9b9] hover:text-[#e71921] hover:scale-110 transition duration-300"
            >
              <FaWhatsapp />
            </a>

          </div>

          {/* Frase */}
          <p className="mt-8 text-[#b9b9b9] text-sm leading-relaxed">
            Sabores auténticos del Medio Oriente.
          </p>
        </div>
      </div>

      {/* Línea */}
      <div className="border-t border-white/10 mx-20"></div>

      {/* Parte inferior */}
      <div className="w-full px-20 py-8 flex flex-col md:flex-row items-center justify-between gap-5 text-sm text-[#b9b9b9]">

        <p>
          © 2026 Jalu. Todos los derechos reservados
        </p>

        <div className="flex gap-8">
          <span className="hover:text-[#e71921] cursor-pointer transition">
            Política de privacidad
          </span>

          <span className="hover:text-[#e71921] cursor-pointer transition">
            Defensa del consumidor
          </span>
        </div>

      </div>
    </footer>
  );
}
